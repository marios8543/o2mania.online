const fetch = window.fetch.bind(window);
const audioCtx = new window.AudioContext()

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Sample {
    constructor(b64) {
        let bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        audioCtx.decodeAudioData(bytes.buffer).then(buf => {
            this.buffer = buf;
        })
    }

    play(vol, pan) {
        vol = 5
        
        let gain = audioCtx.createGain()
        gain.connect(audioCtx.destination);
        gain.gain.value = vol / 15;

        let source = audioCtx.createBufferSource();
        source.buffer = this.buffer;
        source.connect(gain);
        source.start();
    }
}

class PlayNoteEvent {
    constructor(col, type, sample) {
        this.col = col;
        this.type = type;
        this.sample = sample;
    }
}

class Chart {
    constructor(id) {
        this.id = id;

        this.samples = {};
        this.notes = {};
        this.bpm = 0;
        this.delay = 0;
        this.measure = -1;
        this.stopflag = false;

        this.measure_callback = function () { }
    }

    async initialize(difficulty) {
        let data = await (await fetch(`resources/charts/${this.id}/samples.json`)).json();
        for (let i in data) {
            this.samples[i.split(".")[0]] = new Sample(data[i]);
        }
        data = await (await fetch(`resources/charts/${this.id}/chart.json`)).json();
        this.measure_count = data[`measure_count${difficulty + 1}`];
        this.setBpm(data.bpm);

        let notes = data.notes[difficulty];
        notes.forEach(pack => {
            if (!(pack.measure in this.notes)) this.notes[pack.measure] = [];
            this.notes[pack.measure].push(pack);
        });
    }

    async start() {
        for (let i = 1; i < this.measure_count; i++) {
            if (this.stopflag) break;
            if (i in this.notes) {
                for (let ii = 0; ii < this.notes[i].length; ii++) {
                    let pack = this.notes[i][ii];
                    if (pack.channel == 0);//IGNORE: measure fraction. no idea how to implement this
                    else if (pack.channel == 1) this.handleBpmChanges(pack.events, this.delay);
                    else if (pack.channel >= 2 && pack.channel <= 8) this.handlePlayEvents(pack.events, pack.channel);
                    else this.handleBgEvents(pack.events);
                }
            }
            await sleep(this.delay * 1000);
            console.log(`measure ${i} bpm ${this.bpm}`);
        }
    }

    async handleBgEvents(evList) {
        let delay = (this.delay / evList.length) * 1000;
        for (let i = 0; i < evList.length; i++) {
            let ev = evList[i];
            if (ev.note_type == 4) ev.value += 1000;
            if (ev.value != 0 && ev.note_type != 3) {
                let sample = this.samples[ev.value];
                if (sample) sample.play(ev.volume, 0);
            }
            await sleep(delay);
        }
    }

    handlePlayEvents(evList, channel) {
        let evs = [];
        evList.forEach(ev => evs.push(new PlayNoteEvent(channel - 1, ev.note_type, ev.value)));
        this.event_callback(evs);
    }

    async handleBpmChanges(evList, delay) {
        console.log(evList);
        delay = (delay / evList.length) * 1000;
        for (let i = 0; i < evList.length; i++) {
            let bpm = evList[i];
            if (bpm != 0) this.setBpm(bpm);
            await sleep(delay);
        }
    }

    stop() {
        this.stopflag = true;
    }

    setBpm(bpm) {
        this.bpm = bpm;
        this.delay = 240 / this.bpm;
    }

    setMeasureCallback(callback) {
        this.event_callback = callback;
    }
}