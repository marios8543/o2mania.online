const app = new Vue({
    el: "#mainWrap",
    components: {
       // "chart-player": ChartPlayerComponent,
        "player-box": PlayerBoxComponent
    },
    data: {
        resources: RESOURCE_URL,
        roomName: "",
        speed: 0,
        maxSpeed: 5,
        isHost: false,
        currentSong: {
            id: "o2ma100",
            title: "Bach Alive",
            bpm: 170
        },
        TeamColors : {A: "red", B: "orange", C: "yellow", D: "lime", E: "cyan", F: "blue", G: "purple", H: "brown"},
        Genres:["Ballad", "Rock", "Dance" ,"Techno" ,"Hip-hop" ,"Soul/R&B" ,"Jazz" ,"Funk" ,"Classical" ,"Traditional" ,"Etc"],
        players: [new Player("Test-kun", "https://sh.tzatzikiweeb.moe/mikuspin.gif", 89, "B")],
        messages: [new Message("Test-kun", "Fuck joggers")]
    },
    methods: {

    },
    mounted: function() {

    }
})