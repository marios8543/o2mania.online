const app = new Vue({
    el: "#mainWrap",
    components: {
        "chart-player": ChartPlayerComponent,
        "player-box": PlayerBoxComponent
    },
    data: {
        speed: 0,
        TeamColors : {
            A: "red",
            B: "orange",
            C: "yellow",
            D: "lime",
            E: "cyan",
            F: "blue",
            G: "purple",
            H: "brown"
        },
        players: [
            new Player("Test-kun", "https://sh.tzatzikiweeb.moe/mikuspin.gif", 89, "B")
        ],
        messages: [new Message("Test-kun", "Fuck joggers")]
    }
})