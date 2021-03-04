document.getElementById("mainCanvas").setAttribute("height", window.innerHeight - 20);
const HEIGHT = window.innerHeight - 20;
const WIDTH = 480;
const SCALING = 2.13;
const boundKeys = [65, 83, 68, 32, 74, 75, 76];
const canvas = new Renderer();
const skin = {
    keys: {
        resource: "keypad.png",
        limits: [
            { start: 0, end: 30, pressColor: "rgba(255,0,127,0.7)", note: "note.png", notelong: "notelong.png" },
            { start: 30, end: 60, pressColor: "rgba(51,51,225,0.7)", note: "note.png", notelong: "notelong.png" },
            { start: 60, end: 90, pressColor: "rgba(255,0,127,0.7)", note: "note.png", notelong: "notelong.png" },
            { start: 90, end: 135, pressColor: "rgba(255,0,127,0.7)", note: "notewide.png", notelong: "notelongwide.png" },
            { start: 135, end: 165, pressColor: "rgba(255,0,127,0.7)", note: "note.png", notelong: "notelong.png" },
            { start: 165, end: 195, pressColor: "rgba(51,51,225,0.7)", note: "note.png", notelong: "notelong.png" },
            { start: 195, end: 225, pressColor: "rgba(255,0,127,0.7)", note: "note.png", notelong: "notelong.png" }
        ]
    },
    line: "line.png"
}

const keyImage = new Image();
keyImage.src = `resources/skin/${skin.keys.resource}`;
keyImage.onload = function () { canvas.addDrawable(keyImage, 0, HEIGHT - keyImage.height * SCALING); }

const lineImage = new Image();
lineImage.src = `resources/skin/${skin.line}`;

const noteImages = {};
skin.keys.limits.forEach(key => {
    if (!(key.note in noteImages)) {
        noteImages[key.note] = new Image();
        noteImages[key.note].src = `resources/skin/${key.note}`;
        noteImages[key.notelong] = new Image();
        noteImages[key.notelong].src = `resources/skin/${key.notelong}`;
    }
});