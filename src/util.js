export function createGL(canvas){
    if(!canvas){
        canvas = document.createElement('canvas');
        document.body.appendChild(canvas)
    }
    var gl = canvas.getContext("webgl", { antialias: false }) 
          || canvas.getContext("experimental-webgl", { antialias: false });
    if (!gl) alert('Could not initialize WebGL, try another browser');
    return gl;
}

// function loadImage(url, cb){
//     var image = new Image,
//         canvas = document.createElement('canvas'),
//         ctx = canvas.getContext('2d');
//     image.src = url;
//     image.onload = function(){
//         canvas.width = image.naturalWidth;
//         canvas.height = image.naturalHeight;
//         ctx.drawImage(image, 0, 0)
//         cb(ctx.getImageData(0, 0, canvas.width, canvas.height))
//     }
// }

