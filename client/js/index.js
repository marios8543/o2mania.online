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
        ws: new WebSocket(`wss://${API}/socket`),

        roomName: "",
        speed: 0,
        maxSpeed: 5,
        TeamColors: { A: "red", B: "orange", C: "yellow", D: "lime", E: "cyan", F: "blue", G: "purple", H: "brown" },
        isHost: false,

        selectSong: false,
        currentSong: {},
        players: {},
        messages: []
    },
    methods: {
        handleWsMessage: function(msg) {
            console.log(msg)
            let data = JSON.decode(msg);
            let payload = data.d;
            switch(data.t) {
                case "player":
                    this.players[payload.username] = Player(payload);
                    break;
                case "player_rm":
                    delete this.players[payload.username];
                    break;
                case "song":
                    this.currentSong = payload;
                    break;
                case "message":
                    this.messages.push(payload);
                    break;
                default:
                    break;
            }
        }
    },
    mounted: function() {
        this.ws.on_message = this.handleWsMessage;
        let _this = this;
        fetch(`${CDN}/charts/charts.json`).then(resp => {
            resp.json().then(json => {
                _this.songList = json;
                _this.selectedSong = json.filter(i => i.genre == this.currentGenre)[0];
            });
        });
    }
});