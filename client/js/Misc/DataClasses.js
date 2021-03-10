class Player {
    constructor(username, profile_pic, level, team) {
        this.username = username;
        this.profile_pic = profile_pic;
        this.level = level;
        this.team = team
    }

    getDisplay() {
        return `Lv:${this.level} ${this.username}`;
    }
}

class Message {
    constructor(author, content) {
        this.author = author;
        this.content = content;
    }
}