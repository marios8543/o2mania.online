require "kemal"
require "./state_keeper"
require "./routes/*"

module O2ManiaServer
  VERSION = "0.1.0"
  GAMES = Hash(String, Game).new

  Kemal.run
end
