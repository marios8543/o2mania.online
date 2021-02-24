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
}

class Renderer {
    constructor() {
        this.drawList = {};
        /** @type {CanvasRenderingContext2D} */
        this.canvas = document.getElementById("mainCanvas").getContext("2d");
        window.requestAnimationFrame(this._redraw.bind(this));
    }

    _redraw() {
        this.canvas.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
        for (let i in this.drawList) {
            let item = this.drawList[i];
            if (typeof (item) == "object") {
                let width = item.image.width * SCALING * item.width;
                let height = item.image.height * SCALING * item.height;
                this.canvas.drawImage(item.image, item.x, item.y, width, height);
            }
            else item(this.canvas);
        }
        window.requestAnimationFrame(this._redraw.bind(this));
    }

    addDrawable(image, x, y, z, width , height) {
        let d = new Drawable(image, x, y, z, width, height);
        this.drawList[d.id] = d;
        return d.id;
    }

    addCustomDrawable(func) {
        let d = drawableIdIncrementor++;
        this.drawList[d] = func;
        return d;
    }
}