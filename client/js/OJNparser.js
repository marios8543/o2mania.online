const fetch = window.fetch.bind(window);
const audioCtx = new window.AudioContext()
let GLOBAL_VOLUME = 0.5;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Sample {
    constructor(b64) {
        let bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        audioCtx.decodeAudioData(bytes.buffer).then(buf => {
            this.buffer = buf;
        });
    }

    play(vol, pan) {
        if (vol == 0) vol = 15;
        let gain = audioCtx.createGain()
        gain.connect(audioCtx.destination);
        gain.gain.value = (vol / 15) * GLOBAL_VOLUME;

        let source = audioCtx.createBufferSource();
        source.buffer = this.buffer;
        source.connect(gain);
        source.start();
    }
}

class NoteEvent {
    constructor(col, type, sample, volume, chart) {
        this.col = col;
        this.type = type;
        this.sample = sample;
        this.volume = volume
        this.chart = chart;
    }

    play() {
        if (this.sample == 2) return;
        if (this.chart.samples[this.sample])
        this.chart.samples[this.sample].play(this.volume);
    }
}

class LongNoteEvent extends NoteEvent {
    constructor(start, ...args) {
        super(...args);
        this.start = start;
        this.end = !this.start;
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
        this.reactionWindowScale = 0.5;

        this.event_callback = function () {}

        this.stopflag = false;
        this.noPlayerEvents = false;
        this.noBgEvents = false;
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
        for (let i = 0; i < this.measure_count; i++) {
            let playPacks = [];
            let bgPacks = [];
            let bpmChanges;
            if (this.stopflag) break;
            if (i in this.notes) {
                for (let ii = 0; ii < this.notes[i].length; ii++) {
                    let pack = this.notes[i][ii];
                    if (pack.channel == 0);//IGNORE: measure fraction. no idea how to implement this
                    else if (pack.channel >= 2 && pack.channel <= 8) playPacks.push(pack);
                    else if (pack.channel >= 9 && pack.channel <= 22) bgPacks.push(pack);
                    else if (pack.channel == 1) bpmChanges = pack.events;
                }
            }
            let delay = this.delay;
/*
            if (bpmChanges) {
                this.dispatchEvents(playPacks, bgPacks, this.delay);
                await this.handleBpmChanges(bpmChanges);
            }
            else await this.dispatchEvents(playPacks, bgPacks, this.delay);
*/
            if (bpmChanges) this.handleBpmChanges(bpmChanges);
            await this.dispatchEvents(playPacks, bgPacks, delay);
            console.log(`measure ${i} bpm ${this.bpm}`);
        }
    }

    async dispatchEvents(playPacks, bgPacks, delay) {
        for (let _ = 0; _ < playPacks.length; _++) this.handlePlayEvents(playPacks[_].events, playPacks[_].channel);
        await sleep(delay * (1 - this.reactionWindowScale) * 1000);
        for (let _ = 0; _ < bgPacks.length; _++) this.handleBgEvents(bgPacks[_].events, delay);
        await sleep(delay * (this.reactionWindowScale) * 1000);
    }

    async handleBgEvents(evList, _delay) {
        let delay = (_delay / evList.length) * 1000;
        for (let i = 0; i < evList.length; i++) {
            let ev = evList[i];
            if (ev.note_type == 4) ev.value += 1000;
            if (ev.value != 0 && ev.note_type != 3) {
                let sample = this.samples[ev.value];
                if (sample && !this.noBgEvents) sample.play(ev.volume, 0);
            }
            await sleep(delay);
        }
    }

    handlePlayEvents(evList, channel) {
        let evs = [];
        evList.forEach(ev => {
            ev.col--;
            if (ev.note_type == 2) evs.push(new LongNoteEvent(true, channel - 2, ev.note_type, ev.value, ev.volume, this));
            else if (ev.note_type == 3) evs.push(new LongNoteEvent(false, channel - 2, ev.note_type, ev.value, ev.volume, this));
            else evs.push(new NoteEvent(channel - 2, ev.note_type, ev.value, ev.volume, this));
        });
        this.event_callback(evs);
    }

    async handleBpmChanges(evList) {
        for (let i = 0; i < evList.length; i++) {
            let bpm = evList[i];
            if (bpm != 0) this.setBpm(bpm);
            await sleep((this.delay / evList.length) * 1000);
        }
    }

    stop() {
        this.stopflag = true;
    }

    setBpm(bpm) {
        this.bpm = bpm;
        this.delay = 240 / this.bpm;
    }

    getDelay() {
        return 240 / this.bpm;
    }
}