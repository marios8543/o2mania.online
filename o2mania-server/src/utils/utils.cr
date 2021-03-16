class Uid
    @@r = Random.new

    def self.get_id
        @@r.hex
    end
end