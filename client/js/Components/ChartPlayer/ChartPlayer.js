const ChartPlayerComponent = {
    template: `
    <div>
        <canvas v-show="ready" v-bind:width="WIDTH" id="mainCanvas"></canvas>
        <div id="chart_bg" class="bg" v-if="!ready">
            <span class="loadingMsgBar">
                <span class="loadingMsg">
                <div class="loader">{{ loadingMessage }}</div>
                </span>
            </span>
        </div>
    </div>
    `,
    props: ["chartid", "difficulty"],
    methods: {
        start: function() {
            this.ready = true;
            this.chart.start();
        },
        lightCol: function(colIdx) {
            if (this.downEffectIds[colIdx] != -1) return;
            let col = skin.keys.limits[colIdx];
            if (col in this.downEffectIds) return;
            let id = this.canvas.addCustomDrawable(function (ctx) {
                ctx.fillStyle = col.pressColor;
                ctx.fillRect(col.start * SCALING, 0, (col.end - col.start) * SCALING, this.HEIGHT);
            });
            this.downEffectIds[colIdx] = id;
        },
        unlightCol: function(colIdx) {
            delete this.canvas.drawList[this.downEffectIds[colIdx]];
            this.downEffectIds[colIdx] = -1;
        },
        flashCol: function(colIdx) {
            let col = skin.keys.limits[colIdx];

        },
        keyDown: function(e) {
            if (this.boundKeys.includes(e.code)) {
                let colIdx = this.boundKeys.indexOf(e.code);
                if (this.colSamples[colIdx] && (this.downEffectIds[colIdx] == -1)) this.colSamples[colIdx].play();
                this.lightCol(colIdx);
            }
            if (e.code == 80) chart.start();
        },
        keyUp: function(e) {
            if (this.boundKeys.includes(e.code)) {
                let colIdx = this.boundKeys.indexOf(e.code);
                this.unlightCol(colIdx);
            }
        },
        eventCallback: async function(evs) {
            this.droppingNotes[this.canvas.addDrawable(this.lineImage, 0, 0, width = 0.1)] = null;
            for (let i = 0; i < evs.length; i++) {
                let ev = evs[i];
                let l = skin.keys.limits[ev.col];
                let height = 1;

                if (ev.sample != 0) {
                    if (ev instanceof LongNoteEvent) {
                        if (ev.start) {
                            //let length = (evs.slice(i).findIndex((_) => (_ instanceof LongNoteEvent && _.end)) || evs.length) - i;
                            //height = (measurePx / evs.length) * Math.abs(length);
                        }
                    }
                    this.droppingNotes[this.canvas.addDrawable(this.noteImages[l.note], l.start * SCALING, 0, 0, 1, height)] = ev;
                }
                await sleep((this.chart.delay / evs.length) * 1000);
            }
        },
        updateShit: function() {
            this.measurePx = this.SPEED * (this.JUDGE_LINE / this.chart.delay);
            this.mps = 1 / this.chart.delay;
            this.pps = this.mps * this.measurePx;
            //this.chart.reactionWindowScale = this.JUDGE_LINE / this.pps;
        },
        getScrollPx: function() {
            return (this.canvas.timeDelta / 1000) * this.pps;
        },
        playLoop: async function() {
            while (true) {
                this.updateShit();
                for (let note in this.droppingNotes) {
                    this.canvas.drawList[note].y += this.getScrollPx();
                    if (this.canvas.drawList[note].y > this.JUDGE_LINE) {
                        if (this.autoPlay && this.droppingNotes[note]) this.colSamples[this.droppingNotes[note].col].play();
                        delete this.canvas.drawList[note];
                        delete this.droppingNotes[note];
                    }
                    else if (this.canvas.drawList[note].y > this.REACT_LINE && this.droppingNotes[note]) {
                        let n = this.droppingNotes[note];
                        this.colSamples[n.col] = n;
                    }
                }
                await sleep(this.canvas.timeDelta);
            }
        }
    },
    data: function() {
        return {
            selfready: false,
            ready:false,
            loadingMessage: "Loading chart...",

            HEIGHT: window.innerHeight - 20,
            WIDTH: 540,
            SCALING : 2.13,
            canvas: null,
            keyImage: new Image(),
            lineImage: new Image(),
            noteImages: {},

            boundKeys: ["KeyA", "KeyS", "KeyD", "Space", "KeyJ", "KeyK", "KeyL"],
            downEffectIds : [-1, -1, -1, -1, -1, -1],
            colSamples : [null, null, null, null, null, null],
            droppingNotes : {},
            REACT_START_LINE_PERCENT: 0.6,
            SPEED: 3,
            autoPlay: true,

            JUDGE_LINE : 0,
            REACT_LINE : 0,
            measurePx : 0,
            mps : 0,
            pps : 0
        }
    },
    mounted: function() {
        document.getElementById("chart_bg").style.backgroundImage = `url("${CDN}/charts/${this.chartid}/cover.jpeg")`;
        document.getElementById("mainCanvas").setAttribute("height", window.innerHeight - 20);
        this.canvas = new Renderer(document.getElementById("mainCanvas"), this.SCALING);
        this.keyImage.src = `${CDN}/skin/${skin.keys.resource}`;
        this.keyImage.onload = initKeypad.bind(this)
        function initKeypad() {
            this.canvas.addDrawable(this.keyImage, 0, this.HEIGHT - this.keyImage.height * this.SCALING);
            this.JUDGE_LINE = (this.HEIGHT - (this.keyImage.height * SCALING));
            this.REACT_LINE = (this.HEIGHT - (this.keyImage.height * SCALING)) * this.REACT_START_LINE_PERCENT;
        }
        this.lineImage.src = `${CDN}/skin/${skin.line}`;
        skin.keys.limits.forEach(key => {
            if (!(key.note in this.noteImages)) {
                this.noteImages[key.note] = new Image();
                this.noteImages[key.note].src = `${CDN}/skin/${key.note}`;
                this.noteImages[key.notelong] = new Image();
                this.noteImages[key.notelong].src = `${CDN}/skin/${key.notelong}`;
            }
        });

        document.onkeydown = this.keyDown;
        document.onkeyup = this.keyUp;

        this.chart = new Chart(this.chartid);
        this.chart.initialize(parseInt(this.difficulty)).then(() => {
            this.chart.event_callback = this.eventCallback;

            this.selfready = true;
            this.loadingMessage = "Waiting for players..."
            this.playLoop();
            console.log(this.chart.reactionWindowScale);

            this.autoPlay = true;
            //this.chart.start();
        });
    }
}
