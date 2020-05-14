/*
    Madelbrot fractal viewer for Z^(1-4)
    by admorsus and pachamama
*/

var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
var width = window.innerWidth;
var height = window.innerHeight;
var sqmax = Math.max(width, height);
var offset = sqmax - Math.min(width, height);
canvas.width = width;
canvas.height = height;
ctx.fillStyle = "#000000";

/* map(x) : encuentra que valor entre -2 y 2
   es el equivalente a x entre 0 y width */
const map = (num, inmin, inmax, outmin, outmax) => {
    return (num - inmin) * (outmax - outmin) / (inmax - inmin) + outmin;
}

var zoom = 0.9;
var zoomratio = 1.5;
var movx = -0.3;
var movy = 1;

document.body.onclick = function (event) {
    zoom *= zoomratio;
    movx += map(event.clientX, 0, width, -2, 2) / zoom;
    movy += map(event.clientY, 0, height, -2, 2) / zoom;
    mandelbrot(movx, movy, zoom);
};

document.body.onkeyup = function (e) {
    if (e.keyCode == 32) {
        zoom = zoom / zoomratio;
        mandelbrot(movx, movy, zoom);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function animation() {
    for (var i = 0; i < 50000; i++) {
        zoom *= 1.1;
        mandelbrot(movx, movy, zoom);
        sleep(5);
    }
}

function generatePalette() {
    var palette = [];
    var roffset = 16;
    var goffset = 24;
    var boffset = 0;
    for (var i = 0; i < 256; i++) {
        palette[i] = { r: roffset, g: goffset, b: boffset };

        if (i < 64) {
            goffset += 3;
            roffset += 0.2;
        } else if (i < 128) {
            roffset += 3;
            goffset += 0.1;
        } else if (i < 192) {
            boffset += 3;
        }
    }
    return palette;
}

const z2a = (a, b) => { return a * a - b * b; };
const z2b = (a, b) => { return 2 * a * b };

const z3a = (a, b) => { return a * a * a - 3 * a * b * b };
const z3b = (a, b) => { return 3 * a * a * b - b * b * b };

const z4a = (a, b) => { return Math.pow(a, 4) - 6 * a * a * b * b + Math.pow(b, 4) };
const z4b = (a, b) => { return 4 * Math.pow(a, 3) * b - 4 * a * Math.pow(b, 3) };


function mandelbrot(xmov, ymov, zoom) {

    var max_iterations = 100;
    var iterator = 0.3;

    var palette = generatePalette();

    var imagedata = ctx.createImageData(width, height);
    var pixels = imagedata.data;

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {

            var a = map(x, 0, sqmax, -2, 2) / zoom + xmov; //+ 0.2;
            var b = map(y, 0, sqmax, -2, 2) / zoom + ymov;

            var n = 0;
            var ca = a, cb = b;

            while (n < max_iterations) {
                var aa = z2a(a, b);
                var bb = z2b(a, b);
                a = aa + ca;
                b = bb + cb;
                if (a * a + b * b > 16) {
                    break;
                }
                n += iterator;
            }

            var bright = map(n, 0, max_iterations, 0, 1); // 255
            bright = map(Math.pow(bright, 1 / 1.3), 0, 1, 0, 255);

            var color;
            if (n >= 100) {
                color = palette[255];
            } else {
                index = Math.floor(bright);
                color = palette[index];
            }

            var pix = (y * width + x) * 4;
            pixels[pix + 0] = color.r;
            pixels[pix + 1] = color.g;
            pixels[pix + 2] = color.b;
            pixels[pix + 3] = 255;
        }
    }
    ctx.putImageData(imagedata, 0, 0);
}

// Main loop
window.onload = function () {
    mandelbrot(movx, movy, zoom);
}
