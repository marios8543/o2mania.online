const PlayerBoxComponent = {
    props: ['username', 'profilepic', 'team'],
    template: `
    <div v-bind:class="'playerBox col-span '+team">
    <img v-bind:src="profilepic" class="playerImage">
    <span class="playerBoxUsername"><a>{{ username }}</a></span>
    </div>
    `,
    data: function() {
        return {
            isHost: false,
            isReady: false
        }
    }
}