def get_info(ctx : HTTP::Server::Context)
    game = GAMES[ctx.params.query["gameid"]].as(Game)
    player = game.players[ctx.params.query["playerid"]].as(Player)
    {game, player}
end

get "/game/create" do |ctx|
    game = Game.new ctx.params.query["name"]
    GAMES[game.id] = game
    {"gameid" => game.id}.to_json
end

get "/game/give_host" do |ctx|
    game, player = get_info ctx
    give = ctx.params.query["giveusername"]
    if player.is_host
        ok = false
        game.players.each_value do |val|
            if val.username == give
                game.players[val.id].is_host = true
                player.is_host = false
                ok = false
            end
        end
        if ok
            "OK"
        else
            ctx.response.respond_with_status(404, "no_can_give")
        end
    else
        ctx.response.respond_with_status(403, "not_host")
    end
end

get "/game/set_song" do |ctx|
    game, player = get_info ctx
    songid = ctx.params.query["songid"]
    if player.is_host
        begin
            game.set_song songid
            "OK"
        rescue exception
            if exception.to_s == "invalid_song"
                ctx.response.respond_with_status(404, "invalid_song")
            else
                raise exception
            end
        end
    else
        ctx.response.respond_with_status(403, "not_host")
    end
end

get "/game/set_room_name" do |ctx|
    game, player = get_info ctx
    room_name = ctx.params.query["name"]
    if player.is_host
        game.name = room_name
        "OK"
    else
        ctx.response.respond_with_status(403, "not_host")
    end
end

get "/game/change_team" do |ctx|
    game, player = get_info ctx
    team = ctx.params.query["team"]
    game.set_player_team(player, team.to_i)
    "OK"
end

get "/game/message" do |ctx|
    game, player = get_info ctx
    message = ctx.params.query["message"]
    game.message(message, player.username)
    "OK"
end