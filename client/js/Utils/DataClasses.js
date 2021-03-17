class Player {
    constructor(data) {
        this.username = data.username;
        this.profile_pic = "https://sh.tzatzikiweeb.moe/mikuspin.gif";
        this.level = 1;
        this.team = data.team
        this.is_host = data.is_host
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