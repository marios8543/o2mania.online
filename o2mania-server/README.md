# o2mania-server

Server component of the o2mania.online game. Everything is written in Crystal with Kemal

# Documentation

## Game HTTP Routes
### The strings after **?** are query parameters.

* **GET** `/game/create` ? `name`
    * 200 - JSON Response: `{"gameid": game.id}`
* **GET** `/game/give_host` ? `gameid`, `playerid`, `giveusername`
    * 200 - Plain text: `OK`
    * 404 - Plain text: `no_can_give` The giveusername is invalid
    * 403 - Plain text: `not_host`
    * 500 - Plain text: Some other error, usually related to invalid gameid/playerid
* **GET** `/game/set_song` ? `gameid`, `playerid`, `songid`
    * 200 - Plain text: `OK`
    * 404 - Plain text: `invalid_song`
    * 403 - Plain text: `not_host`
    * 500 - Plain text: Some other error, usually related to invalid gameid/playerid
* **GET** `/game/change_team` ? `gameid`, `playerid`, `team`
    * 200 - Plain text: `OK`
    * 500 - Plain text: Some other error, usually related to invalid gameid/playerid
            Maybe team is not a number or it's not in range [0, 7] ?
* **GET** `/game/message` ? `gameid`, `playerid`, `message`
    * 200 - Plain text: `OK`
    * 500 - Plain text: Some other error, usually related to invalid gameid/playerid

## Game WebSocket Events
### All messages here, both sent and received, are JSON encoded and follow more or less the same structure (t: message type, d: payload).

#### **Join/Leave messages (What you should send)**
>{\
>  "t" : "join_game", \
>  "d" : { \
>    "game_id" : "b96b09f728dab6eafa7fc50668c4c95b",\
>    "username" : "funne"\
>  }\
>}

>{\
>  "t" : "leave_game"\
>}

#### **In-game events (What you will receive)**
 Updates the state of a player.
>{\
>  "t" : "player", \
>  "d" : { \
>    "username" : "funne",\
>    "is_host" : true | false\
>    "team" : 0-7\
>  }\
>}

 Removes a player.
>{\
>  "t" : "player_rm", \
>  "d" : { \
>    "username" : "funne",\
>    "is_host" : true | false\
>    "team" : 0-7\
>  }\
>}

 Updates the state of the game/lobby.
>{\
>  "t" : "game", \
>  "d" : { \
>       "name" : "Lobby name"\
>       "song" : {\
>           "id" : "o2maXXX",\
>           "bpm" : 170.0,\
>           "genre" : 0-10,\
>           "title" : "Ching Cheng Hanji",\
>           "artist" : "Kim Jong Un",\
>           "noter" : "NPC #754964",\
>           "times" : [130, 130, 130]\
>       }\
>  }\
>}

 A chat message.
>{\
>  "t" : "message", \
>  "d" : { \
>    "author" : "funne",\
>    "content" : "Im retarded lole"\
>  }\
>}
