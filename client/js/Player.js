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

const chart = new Chart("o2ma174");
chart.initialize(1).then(() => {
    const SCROLL_BOTTOM = (HEIGHT - (keyImage.height * SCALING));
    const SCROLL_RATE = 10;
    const SPEED = 3;
    const droppingNotes = {};
    const longNotes = {};
    let measurePx;
    let mps;
    let pps;

    chart.setMeasureCallback(async function (evs) {

        droppingNotes[canvas.addDrawable(lineImage, 0, 0, width = 0.1)] = false;
        for (let i = 0; i < evs.length; i++) {
            let ev = evs[i];
            if (ev.sample != 0) {
                let l = skin.keys.limits[ev.col];
                colSamples[ev.col] = chart.samples[ev.sample];
                colVolumes[ev.col] = ev.volume;
                let drw = canvas.addDrawable(noteImages[l.note], l.start * SCALING, 0);
                droppingNotes[drw] = false;
                if (ev instanceof LongNoteEvent) {
                    if (!(drw in longNotes)) longNotes[drw] = ev;
                    longNotes[drw].counter++;
                }
            }
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
            for (let note in droppingNotes) {
                if (longNotes[note]) {
                    if (longNotes[note].start) canvas.drawList[note].height = measurePx / longNotes[note].counter;
                }
                canvas.drawList[note].y += getScrollPx() //- canvas.drawList[note].height;
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