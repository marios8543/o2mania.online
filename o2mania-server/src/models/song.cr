require "json"

SONG_LIBRARY = Array(JSON::Any).from_json(File.open(ENV["LIBRARY_JSON_PATH"]))

class Song
    getter id : String
    getter bpm : Float64
    getter genre : Int32
    getter title : String
    getter artist : String
    getter noter : String
    getter times : Array(Int32)

    def initialize(data : JSON::Any)
        @id = data["id"].as_s
        @bpm = data["bpm"].as_f
        @genre = data["genre"].as_i
        @title = data["title"].as_s
        @artist = data["artist"].as_s
        @noter = data["noter"].as_s
        @times = [data["times"][0].as_i, data["times"][1].as_i, data["times"][2].as_i]
    end

    def self.from_id(_id : String)
        res : JSON::Any | Nil = nil
        SONG_LIBRARY.each do |x|
            if x["id"] == _id
                res = x
                break
            end
        end
        if res.is_a?(JSON::Any)
            self.new res
        else
            raise "Invalid song ID"
        end
    end

    def to_hash
        {"id" => @id, "bpm" => @bpm, "genre" => @genre, "title" => @title, "artist" => @artist, "noter" => @noter, "times" => @times}
    end
end