const SongSelectComponent = {
    template: `
<div v-bind:class="(preClose ? 'fadeout' : '')+ ' songSelectModal grid grid-flow-col auto-cols-max fadein'">
<div>
    <ul class="genreList">
    <li class="allVisibleText" v-for="(genre, index) in Genres"><button v-on:click="currentGenre = index">{{ genre }}</button></li>
    </ul>
</div>
<div>
    <table class="songTable allVisibleText">
    <colgroup>
        <col width="80%%" />
        <col width="10%" />
        <col width="10%" />
    </colgroup>
    <thead>
        <tr>
        <th>Title</th>
        <th class="pr-5">Level</th>
        <th class="pr-4">Duration</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="song in songList.filter(i => i.genre == currentGenre)" v-on:click="select(song.id)">
        <td style="max-width:1px;" class="pl-2 w-3 truncate" v-bind:title="song.title">{{ song.title }}</td>
        <td class="pr-5">18</td>
        <td class="pr-4">{{ song.times[0] }}</td>
        </tr>
    </tbody>
    </table>
</div>
<div>
    <div class="songCard">
    <img v-bind:src="resources+'/charts/'+selectedSong.id+'/cover.jpeg'">
    <span class="pl-2 allVisibleText text-l truncate w-60">Title: {{ selectedSong.title }}</span><br>
    <span class="pl-2 allVisibleText text-l truncate w-60">Artist: {{ selectedSong.artist }}</span><br>
    <span class="pl-2 allVisibleText text-l truncate w-60">Noter: {{ selectedSong.noter }}</span><br>
    <span class="pl-2 allVisibleText text-l truncate w-60">BPM: {{ selectedSong.bpm }}</span>
    </div>
    <div class="difSelect">
    <button v-on:click="difficulty = 0" class="allVisibleText mr-3 bg-green-400">EZ</button>
    <button v-on:click="difficulty = 1" class="allVisibleText mr-3 bg-pink-400">NM</button>
    <button v-on:click="difficulty = 2" class="allVisibleText bg-red-400">MX</button>
    </div>
    <div class="confirmButtons">
    <button v-on:click="close" class="allVisibleText">Cancel</button>
    <button v-on:click="confirm" class="allVisibleText">OK</button>
    </div>
</div>
</div>
    `,
    props: ["resources"],
    data: function() {
        return {
            Genres: ["Ballad", "Rock", "Dance" ,"Techno" ,"Hip-hop" ,"Soul/R&B" ,"Jazz" ,"Funk" ,"Classical" ,"Traditional" ,"Etc"],
            songList: [],
            currentGenre: 0,
            selectedSong: {},
            preClose: false,
            difficulty: 0
        }
    },
    methods: {
        close() {
            this.$emit("close");
        },
        select(id) {
            let song = this.songList.filter(i => i.id == id)[0];
            this.selectedSong = song;
        },
        confirm() {
            this.selectedSong.difficulty = this.difficulty;
            this.$emit("changesong", this.selectedSong);
            this.close();
        }
    },
    mounted: function() {
        let _this = this;
        fetch(`${CDN}/charts/charts.json`).then(resp => {
            resp.json().then(json => {
                _this.songList = json;
                _this.selectedSong = json.filter(i => i.genre == this.currentGenre)[0];
            });
        });
    }
}