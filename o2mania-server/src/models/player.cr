require "./user"
require "../utils/utils"

class Player
    getter id : String
    getter username : String
    getter websocket : ConnectedClient
    setter websocket
    getter is_host : Bool
    setter is_host
    getter team : Int32
    setter team

    def initialize(websocket, username, id = Uid.get_id)
        @id = id
        @username = username
        @websocket = websocket
        @is_host = false
        @team = 0
    end

    def broadcast(message : Hash)
        @websocket.send(message.to_json)
    end

    def to_hash
        {"username" => @username, "is_host" => @is_host, "team" => @team}
    end
end