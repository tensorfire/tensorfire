async function loadArrayFromURL(fileName){
    var buffer = new Float32Array(await loadBuffer(fileName))
    var shape = fileName.match(/\d+(x\d+)*$/)[0].split('x').map(k => +k)
    return ndarray(buffer, shape)
}


function createProgress(label){

    var container = document.createElement('div')

    container.style.position = 'absolute'
    container.style.top = 0;
    container.style.left = 0;
    container.style.width = '100%'
    container.style.padding = '20px'
    container.style.boxSizing = 'border-box'

    container.appendChild(document.createTextNode(label || ''))

    var prog = document.createElement('progress')
    prog.style.width = '100%'
    
    container.appendChild(prog)


    document.body.appendChild(container)

    prog.destroy = function(){
        document.body.removeChild(container)
    }
    return prog;
}

async function loadBuffer(fileName){
    var xhr = new XMLHttpRequest()
    xhr.open('GET', fileName, true)
    xhr.responseType = 'arraybuffer'
    xhr.send(null)

    var prog = createProgress('downloading ' + fileName)
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


function h(type, children = [], style = {}){
    var el = document.createElement(type);
    ;(Array.isArray(children) ? children : [ children ])
        .forEach(k => el.appendChild(typeof k != 'object' ? 
            document.createTextNode(k) : k));
    ;Object.keys(style).forEach(k => el.style[k] = style[k]);
    return el
}
