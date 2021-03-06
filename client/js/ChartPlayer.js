const downEffectIds = [-1, -1, -1, -1, -1, -1];
const colSamples = [null, null, null, null, null, null];

const keyShortcuts = {
    keyP: function () { chart.start() }
}

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
        if (colSamples[colIdx] && (downEffectIds[colIdx] == -1)) colSamples[colIdx].play();
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

const chart = new Chart("o2ma197");
chart.initialize(1).then(() => {
    const droppingNotes = {};

    const JUDGE_LINE = (HEIGHT - (keyImage.height * SCALING));
    const REACT_LINE = (HEIGHT - (keyImage.height * SCALING)) * REACT_START_LINE_PERCENT;
    let measurePx;
    let mps;
    let pps;

    chart.event_callback = async function (evs) {
        droppingNotes[canvas.addDrawable(lineImage, 0, 0, width = 0.1)] = null;
        for (let i = 0; i < evs.length; i++) {
            let ev = evs[i];
            let l = skin.keys.limits[ev.col];
            let height = 1;

            if (ev.sample != 0) {
                if (ev instanceof LongNoteEvent) {
                    if (ev.start) {
                        let length = (evs.slice(i).findIndex((_) => (_ instanceof LongNoteEvent && _.end)) || evs.length) - i;
                        //height = (measurePx / evs.length) * Math.abs(length);
                    }
                }
                droppingNotes[canvas.addDrawable(noteImages[l.note], l.start * SCALING, 0, 0, 1, height)] = ev;
            }
            await sleep((chart.delay / evs.length) * 1000);
        }
    }

    function getScrollPx() {
        return (canvas.timeDelta / 1000) * pps;
    }

    function updateShit() {
        measurePx = SPEED * (JUDGE_LINE / chart.delay);
        mps = 1 / chart.delay;
        pps = mps * measurePx;
        //chart.reactionWindowScale = (JUDGE_LINE / pps);
    }

    async function playLoop() {
        while (true) {
            updateShit();
            for (let note in droppingNotes) {
                canvas.drawList[note].y += getScrollPx();
                if (canvas.drawList[note].y > JUDGE_LINE) {
                    if (autoPlay && droppingNotes[note]) colSamples[droppingNotes[note].col].play();
                    delete canvas.drawList[note];
                    delete droppingNotes[note];
                }
                else if (canvas.drawList[note].y > REACT_LINE && droppingNotes[note]) {
                    let n = droppingNotes[note];
                    colSamples[n.col] = n;
                }
            }
            await sleep(canvas.timeDelta);
        }
    }
    playLoop();
});