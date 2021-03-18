const app = new Vue({
    el: "#mainWrap",
    components: {
        "chart-player": ChartPlayerComponent,
        "player-box": PlayerBoxComponent,
        "song-select": SongSelectComponent
    },
    data: {
        resources: CDN,
        username: "tza",
        playerId: "",
        gameId: "",
        ws: new WebSocket(`wss://${API}/socket`),

        roomName: "",
        speed: 0,
        maxSpeed: 5,
        TeamColors: { A: "red", B: "orange", C: "yellow", D: "lime", E: "cyan", F: "blue", G: "purple", H: "brown" },
        isHost: false,

        selectSong: false,
        currentSong: {},
        players: [],
        messageInput: "",
        messages: []
    },
    methods: {
        onWsMessage: function(msg) {
            let data = JSON.parse(msg.data);
            let payload = data.d;
            switch(data.t) {
                case "auth":
                    this.playerId = payload.player_id;
                    this.gameId = payload.game_id;
                    break;
                case "player":
                    p = new Player(payload);
                    let idx = this.players.findIndex(el => el.username == p.username);
                    if (idx != -1) this.players[idx] = p;
                    else this.players.push(p);
                    this.$forceUpdate();
                    if(p.username == this.username) this.isHost = p.is_host;
                    break;
                case "player_rm":
                    delete this.players[payload.username];
                    break;
                case "game":
                    this.roomName = payload.name;
                    this.currentSong = payload.song;
                    break;
                case "message":
                    this.messages.push(payload);
                    break;
                default:
                    break;
            }
        },
        changeTeam: function(name) {
            let idx = Object.keys(this.TeamColors).indexOf(name)
            fetch(`https://${API}/game/change_team?${
                new URLSearchParams({
                    gameid: this.gameId,
                    playerid: this.playerId,
                    team: idx
                })
            }`);
        },
        changeSong: function(song) {
            fetch(`https://${API}/game/set_song?${
                new URLSearchParams({
                    gameid: this.gameId,
                    playerid: this.playerId,
                    songid: song.id
                })
            }`);
        },
        changeRoomName: function() {
            fetch(`https://${API}/game/set_room_name?${
                new URLSearchParams({
                    gameid: this.gameId,
                    playerid: this.playerId,
                    name: this.roomName
                })
            }`);
        },
        sendMessage: function() {
            fetch(`https://${API}/game/message?${
                new URLSearchParams({
                    gameid: this.gameId,
                    playerid: this.playerId,
                    message: this.messageInput
                })
            }`);
            this.messageInput = "";
        }
    },
    mounted: function() {
        this.ws.addEventListener('message', this.onWsMessage);
    }
});