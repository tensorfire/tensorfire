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
