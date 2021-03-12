const app = new Vue({
    el: "#mainWrap",
    components: {
        "chart-player": ChartPlayerComponent,
        "player-box": PlayerBoxComponent,
        "song-select": SongSelectComponent
    },
    data: {
        resources: CDN,
        roomName: "",
        speed: 0,
        maxSpeed: 5,
        isHost: true,
        selectSong: false,
        currentSong: {},
        TeamColors : {A: "red", B: "orange", C: "yellow", D: "lime", E: "cyan", F: "blue", G: "purple", H: "brown"},
        players: [new Player("Test-kun", "https://sh.tzatzikiweeb.moe/mikuspin.gif", 89, "B")],
        messages: [new Message("Test-kun", "Fuck joggers")],


    },
    methods: {
        changeSong(song) {
            this.currentSong = song;
        }
    },
    mounted: function() {
        console
        let _this = this;
        fetch(`${CDN}/charts/charts.json`).then(resp => {
            resp.json().then(json => {
                _this.songList = json;
                _this.selectedSong = json.filter(i => i.genre == this.currentGenre)[0];
            });
        });
    }
});