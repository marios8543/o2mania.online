let drawableIdIncrementor = 0;

class Drawable {
    constructor(image, x, y, z, width , height) {
        this.id = drawableIdIncrementor++;
        this.image = image;
        this.x = x;
        this.y = y;
        this.z_index = z;
        this.width = width || 1;
        this.height = height || 1;
    }

    _draw(canvas) {
        let width = this.image.width * SCALING * this.width;
        let height = this.image.height * SCALING * this.height;
        canvas.drawImage(this.image, this.x, this.y, width, height);
    }
}

class CustomDrawable {
    constructor(func) {
        this.func = func;
    }

    _draw(canvas) {
        this.func(canvas);
    }
}

class Renderer {
    constructor() {
        /** @type {CanvasRenderingContext2D} */
        this.canvas = document.getElementById("mainCanvas").getContext("2d");
        this.drawList = {};
        this._last_time = new Date().getTime();
        this.timeDelta = 0;

        window.requestAnimationFrame(this._redraw.bind(this));
    }

    _redraw() {
        this.canvas.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
        for (let i in this.drawList) {
            let item = this.drawList[i];
            item._draw(this.canvas);
        }
        this.timeDelta = new Date().getTime() - this._last_time;
        this._last_time = new Date().getTime();
        window.requestAnimationFrame(this._redraw.bind(this));
    }

    addDrawable(image, x, y, z, width , height) {
        let d = new Drawable(image, x, y, z, width, height);
        this.drawList[d.id] = d;
        return d.id;
    }

    addCustomDrawable(func) {
        let d = drawableIdIncrementor++;
        this.drawList[d] = new CustomDrawable(func);
        return d;
    }

    removeDrawable(id) {
        delete this.drawList[id];
    }
}