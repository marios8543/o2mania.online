document.getElementById("mainCanvas").setAttribute("height", window.innerHeight - 20);
const HEIGHT = window.innerHeight - 20;
const WIDTH = 480;
const SCALING = 2.13;
const boundKeys = [65, 83, 68, 32, 74, 75, 76];
const skin = {
    keys: {
        resource: "keypad.png",
        limits: [
            { start: 0, end: 30, pressColor: "rgba(255,0,127,0.7)", note: "note.png", notelong: "notelong.png"},
            { start: 30, end: 60, pressColor: "rgba(51,51,225,0.7)", note: "note.png", notelong: "notelong.png"},
            { start: 60, end: 90, pressColor: "rgba(255,0,127,0.7)", note: "note.png", notelong: "notelong.png"},
            { start: 90, end: 135, pressColor: "rgba(255,0,127,0.7)", note: "notewide.png", notelong: "notelongwide.png"},
            { start: 135, end: 165, pressColor: "rgba(255,0,127,0.7)", note: "note.png", notelong: "notelong.png"},
            { start: 165, end: 195, pressColor: "rgba(51,51,225,0.7)", note: "note.png", notelong: "notelong.png"},
            { start: 195, end: 225, pressColor: "rgba(255,0,127,0.7)", note: "note.png", notelong: "notelong.png"}
        ]
    },
    line: "line.png"
}
const canvas = new Renderer();

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
        if (colSamples[colIdx] && (downEffectIds[colIdx] == -1)) colSamples[colIdx].play(colVolumes[colIdx]);
        lightCol(colIdx);
    }
    if (e.keyCode == 80) chart.start(); 
}
document.onkeyup = function (e) {
    if (boundKeys.includes(e.keyCode)) {
        let colIdx = boundKeys.indexOf(e.keyCode);
        unlightCol(colIdx);
    }
}

const colSamples = [null, null, null, null, null, null];
const colVolumes = [0, 0, 0, 0, 0, 0];

const chart = new Chart("o2ma218");
chart.initialize(1).then(() => {
    const SCROLL_BOTTOM = (HEIGHT - (keyImage.height * SCALING));
    const SCROLL_RATE = 50;
    const SPEED = 3;
    const droppingNotes = {};
    const longNotes = {};
    let measurePx;
    let mps;
    let pps;

    chart.setMeasureCallback(async function (evs) {
        droppingNotes[canvas.addDrawable(lineImage, 0, 0, width=0.1)] = false;
        for (let i = 0; i < evs.length; i++) {
            let ev = evs[i];
            if (ev.sample != 0) {
                let limits = skin.keys.limits[ev.col - 1];
                colSamples[ev.col - 1] = chart.samples[ev.sample];
                colVolumes[ev.col - 1] = ev.volume;
                if (ev.type == 0) droppingNotes[canvas.addDrawable(noteImages[limits.note], limits.start * SCALING, 0)] = false;
                else if (ev.type == 2) {
                    let drw = canvas.addDrawable(noteImages[limits.notelong], limits.start * SCALING, 0);
                    droppingNotes[drw] = new LongNote(ev.col)
                    longNotes[ev.col] = drw;
                }
                else if (ev.type == 3) droppingNotes[longNotes[ev.col]]
            }
            for (let note in droppingNotes) if (droppingNotes[note]) droppingNotes[note].counter++;
            await sleep((chart.delay / evs.length) * 1000);
        }
    });

    function getScrollPx() {
        return (SCROLL_RATE / 1000) * pps;
    }

    async function playLoop() {
        while (true) {
            measurePx = SPEED * (SCROLL_BOTTOM / chart.delay);
            mps = 1 / chart.delay;
            pps = mps * measurePx;
            chart.reactionWindowScale = (SCROLL_BOTTOM / pps) * 0.1;
            for (let note in droppingNotes) {
                if (droppingNotes[note]) {
                    canvas.drawList[note].height = longNotes[note].counter;
                }
                canvas.drawList[note].y += getScrollPx() - canvas.drawList[note].height;
                if (canvas.drawList[note].y > SCROLL_BOTTOM) {
                    delete droppingNotes[note]
                    delete canvas.drawList[note];
                }
            }
            await sleep(SCROLL_RATE);
        }
    }
    playLoop();
});