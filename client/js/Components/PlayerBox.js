const PlayerBoxComponent = {
    props: ['username', 'profilepic', 'team', 'ishost'],
    template: `
    <div v-bind:class="'playerBox col-span '+team">
    <img v-if="ishost" src="img/host.png" class="hostImage">
    <img v-bind:src="profilepic" class="playerImage">
    <span class="allVisibleText playerBoxUsername"><a>{{ username }}</a></span>
    </div>
    `,
    data: function() {
        return {}
    }
}