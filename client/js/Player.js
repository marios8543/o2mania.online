document.getElementById("mainCanvas").setAttribute("height", window.innerHeight);
const HEIGHT = window.innerHeight;
const WIDTH = 480;
const SCALING = 2.13;
const boundKeys = [65, 83, 68, 32, 74, 75, 76];
const skin = {
    keys: {
        resource: "keypad.png",
        limits: [
            { start: 0, end: 30, pressColor: "rgba(255,0,127,0.7)", note: "note.png" },
            { start: 30, end: 60, pressColor: "rgba(51,51,225,0.7)", note: "note.png" },
            { start: 60, end: 90, pressColor: "rgba(255,0,127,0.7)", note: "note.png" },
            { start: 90, end: 135, pressColor: "rgba(255,0,127,0.7)", note: "notewide.png" },
            { start: 135, end: 165, pressColor: "rgba(255,0,127,0.7)", note: "note.png" },
            { start: 165, end: 195, pressColor: "rgba(51,51,225,0.7)", note: "note.png" },
            { start: 195, end: 225, pressColor: "rgba(255,0,127,0.7)", note: "note.png" }
        ]
    }
}
const canvas = new Renderer();

const keyImage = new Image();
keyImage.src = `resources/skin/${skin.keys.resource}`;
keyImage.onload = function () { canvas.addDrawable(keyImage, 0, HEIGHT - keyImage.height * SCALING); }

const noteImages = {};
skin.keys.limits.forEach(key => {
    if (!(key.note in noteImages)) {
        noteImages[key.note] = new Image();
        noteImages[key.note].src = `resources/skin/${key.note}`;
    }
});

function lightCol(colIdx) {
    if (downEffectIds[colIdx] != -1) return;
    let col = skin.keys.limits[colIdx];
    if (col in downEffectIds) return;
    let id = canvas.addCustomDrawable(function (ctx) {
        ctx.fillStyle = col.pressColor;
        ctx.fillRect(col.start * SCALING, 0, (col.end - col.start) * SCALING, HEIGHT);
    })
    downEffectIds[colIdx] = id;
}

function unlightCol(colIdx) {
    delete canvas.drawList[downEffectIds[colIdx]];
    downEffectIds[colIdx] = -1;
}

const downEffectIds = [-1, -1, -1, -1, -1, -1];
document.onkeydown = function (e) {
    if (boundKeys.includes(e.keyCode)) {
        let colIdx = boundKeys.indexOf(e.keyCode);
        lightCol(colIdx);
    }
}
document.onkeyup = function (e) {
    if (boundKeys.includes(e.keyCode)) {
        let colIdx = boundKeys.indexOf(e.keyCode);
        unlightCol(colIdx);
    }
}
document.onkeypress = function(e) {
    if (boundKeys.includes(e.keyCode)) {
        let colIdx = boundKeys.indexOf(e.keyCode);
        unlightCol(colIdx);
    }
}

const colSamples = [null, null, null, null, null, null];
const chart = new Chart("o2ma218");
chart.initialize(1).then(() =>
    chart.setMeasureCallback(async function (evs) {
        for (let i=0; i<evs.length; i++) {
            let ev = evs[i];
            if (ev.type == 0 && ev.sample != 0) {
                let limits = skin.keys.limits[ev.col - 1];
                droppingNotes[canvas.addDrawable(noteImages[limits.note], limits.start * SCALING, 0)] = true;
            }
            await sleep((chart.delay / evs.length) * 1000);
        }
    })
);

const SCROLL_BOTTOM = (HEIGHT - (keyImage.height * SCALING));
const SCROLL_RATE = 50;
let SPEED = 5;
const droppingNotes = {};
let measurePx;
let mps;
let pps;

function getScrollPx() {
    return (SCROLL_RATE / 1000) * pps;
}

async function playLoop() {
    while (true) {
        for (let note in droppingNotes) {
            canvas.drawList[note].y += getScrollPx();
            if (canvas.drawList[note].y > SCROLL_BOTTOM) {
                delete droppingNotes[note]
                delete canvas.drawList[note];
            }
        }
        measurePx = SPEED * (SCROLL_BOTTOM / chart.delay);
        mps = 1 / chart.delay;
        pps = mps * measurePx;
        await sleep(SCROLL_RATE);
    }
}
playLoop();