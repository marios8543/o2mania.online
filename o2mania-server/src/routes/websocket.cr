require "../models/player"

def enter_game(props, socket)
    game_id = props["game_id"].to_s
    username = props["username"].to_s
    player_id = GAMES[game_id].add_player(socket, username)
    return {player_id, game_id}
end

ws "/socket" do |socket, ctx|
    client = ConnectedClient.add_client(socket, ctx)

    player_id = uninitialized String
    game_id = uninitialized String
    in_game = false

    socket.on_message do |message|
        begin
            payload = JSON.parse message
            case payload["t"].to_s
            when "join_game"
                if in_game
                    raise "already_in_game"
                end
                player_id, game_id = enter_game(payload["d"], client)
                in_game = true
                socket.send({"t" => "auth", "d" => {"player_id" => player_id, "game_id" => game_id}}.to_json)
            when "leave_game"
                if !in_game
                    raise "not_in_game"
                end
                GAMES[game_id].remove_player player_id
                in_game = false
            end
        rescue exception
            socket.send({"error" => exception.to_s}.to_json)
        end
    end

    socket.on_close do |_|
        if in_game
            GAMES[game_id].remove_player player_id
        end
        ConnectedClient.remove_client client.ip
    end

    client.start
end