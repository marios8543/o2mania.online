const downEffectIds = [-1, -1, -1, -1, -1, -1];
const colSamples = [null, null, null, null, null, null];
const colVolumes = [0, 0, 0, 0, 0, 0];

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

document.onkeydown = function (e) {
    if (boundKeys.includes(e.code)) {
        let colIdx = boundKeys.indexOf(e.code);
        if (colSamples[colIdx] && (downEffectIds[colIdx] == -1)) 
            colSamples[colIdx].play(colVolumes[colIdx]);
        lightCol(colIdx);
    }
    if (e.code == 80) chart.start();
}

document.onkeyup = function (e) {
    if (boundKeys.includes(e.code)) {
        let colIdx = boundKeys.indexOf(e.code);
        unlightCol(colIdx);
    }
}

const chart = new Chart("o2ma174");
chart.initialize(1).then(() => {
    const droppingNotes = {};

    const SCROLL_BOTTOM = (HEIGHT - (keyImage.height * SCALING));
    const SCROLL_RATE = 10;
    let measurePx;
    let mps;
    let pps;

    chart.event_callback = function(evs) {
        droppingNotes[canvas.addDrawable(lineImage, 0, 0, width = 0.1)] = null;
        for (let i=0; i<evs.length; i++) {
            let ev = evs[i];
            colSamples[ev.col] = chart.samples[ev.sample];
            colVolumes[ev.col] = ev.volume;

            let l = skin.keys.limits[ev.col];
            let pos = (measurePx / evs.length) * i;
            let height = 1;

            if (ev.sample == 0) continue;
            if (ev instanceof LongNoteEvent) {
                if (ev.start) {
                    let length = (evs.findIndex((_) => (_ instanceof LongNoteEvent && _.end)) || evs.length) - i;
                    console.log(length)
                    height = measurePx / length;
                }
            }
            else droppingNotes[canvas.addDrawable(noteImages[l.note], l.start * SCALING, -pos, 0, 1, height)] = ev;
        }
    }

    function getScrollPx() {
        return (SCROLL_RATE / 1000) * pps;
    }

    function updateShit() {
        measurePx = SPEED * (SCROLL_BOTTOM / chart.delay);
        mps = 1 / chart.delay;
        pps = mps * measurePx;
    }

    async function playLoop() {
        while (true) {
            updateShit();
            for (let note in droppingNotes) {
                canvas.drawList[note].y += getScrollPx()
                if (canvas.drawList[note].y > SCROLL_BOTTOM) {
                    delete canvas.drawList[note];
                    delete droppingNotes[note];
                }
            }
            await sleep(SCROLL_RATE);
        }
    }
    playLoop();
});