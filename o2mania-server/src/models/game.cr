require "./song"
require "./player"
require "../utils/utils"

class Game
    getter id : String
    getter name : String
    setter name
    getter song : Song
    setter song
    getter players : Hash(String, Player)

    def initialize(name)
        @id = Uid.get_id
        @name = name
        @players = Hash(String, Player).new
        @song = Song.new SONG_LIBRARY[0]
    end

    def broadcast(message : Hash)
        @players.each_value { |x| x.broadcast message }
    end

    def send_players
        @players.each_value do |x|
            broadcast({"t" => "player", "d" => x.to_hash})
        end
    end

    def send_game
        broadcast({"t" => "game", "d" => {"name" => @name, "song" => @song.to_hash}})
    end

    def message(content : String, author = "System")
        broadcast({"t" => "message", "d" => {"author" => author, "content" => content}})
    end

    def add_player(websocket, username, id = Uid.get_id)
        @players.each_value do |val|
            if val.username == username
                raise "username_taken"
            end
        end
        p = Player.new(websocket, username, id)
        if @players.size == 0
            p.is_host = true
        end
        @players[p.id] = p
        send_players
        send_game
        message(p.username + " joined the game!")
        return p.id
    end

    def remove_player(id)
        broadcast({"t" => "player_rm", "d" => @players[id].to_hash})
        message(@players[id].username + " left the game!")
        @players.delete id
    end

    def set_song(id)
        @song = Song.from_id id
        send_game
    end

    def set_player_team(player, team)
        if team > 7 || team < 0
            raise "Invalid team"
        end
        player.team = team
        broadcast({"t" => "player", "d" => player.to_hash})
    end
end