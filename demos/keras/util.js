async function loadArrayFromURL(fileName){
    var xhr = new XMLHttpRequest()
    xhr.open('GET', fileName, true)
    xhr.responseType = 'arraybuffer'
    xhr.send(null)
    await new Promise(resolve => xhr.onload = resolve)
    var buffer = new Float32Array(xhr.response)
    var shape = fileName.match(/\d+(x\d+)*$/)[0].split('x').map(k => +k)
    return ndarray(buffer, shape)
}


function createProgress(){
    var prog = document.createElement('progress')
    prog.style.position = 'absolute'
    prog.style.width = '100%'
    prog.style.top = 0;
    prog.style.left = 0;
    document.body.appendChild(prog)


    prog.destroy = function(){
        document.body.removeChild(prog)
    }
}

async function loadBuffer(fileName){
    var xhr = new XMLHttpRequest()
    xhr.open('GET', fileName, true)
    xhr.responseType = 'arraybuffer'
    xhr.send(null)


    var prog = createProgress()
    xhr.onprogress = function(progress){
        prog.value = progress.loaded / progress.total
    }

    await new Promise(resolve => xhr.onload = resolve)
    prog.destroy()
    
    return xhr.response;
}

async function loadJSON(fileName){
    return await (await fetch(fileName)).json();
}


async function loadImage(url){
    var image = new Image,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    image.src = url;
    return await new Promise(resolve => {
        image.onload = function(){
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            ctx.drawImage(image, 0, 0)
            resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
        }    
    })
}


function h(type, children = []){
    var el = document.createElement(type);
    (Array.isArray(children) ? children : [ children ])
        .forEach(k => el.appendChild(typeof k != 'object' ? 
            document.createTextNode(k) : k));
    return el
}
