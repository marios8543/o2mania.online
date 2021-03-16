require "./models/game"

class ConnectedClient
    @@clients = Hash(String, ConnectedClient).new

    def self.add_client(socket, context)
        client = ConnectedClient.new(socket, context)
        @@clients[client.ip] = client
    end

    def self.remove_client(ip)
        @@clients.delete ip
    end

    getter socket : HTTP::WebSocket
    getter ip : String

    def initialize(socket, context)
        @socket = socket
        @ip = context.request.headers.has_key?("CF-Connecting-IP") ? context.request.headers["CF-Connecting-IP"] : context.request.remote_address.to_s.split(":")[0]
        @queue = Channel(String).new
        @running = true

        if @@clients.has_key? @ip
            raise "Already connected"
        end
    end

    def send(message)
        @queue.send(message)
    end

    private def handle_messages
        while @running
            begin
                @socket.send(@queue.receive)
            rescue exception
                puts exception
            end
        end
    end

    def start
        spawn do
            handle_messages
        end
    end

    def finalize
        @running = false
        @queue.close
    end
end

GAMES = Hash(String, Game).new