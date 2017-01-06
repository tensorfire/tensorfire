async function compile(gl, network, options){
    var info = {}

    console.time('compiling network')
    while(true){
        var pending = network
            .filter(k => !(k.name in info));

        var ready = pending
            .filter(k => Object.values(k.deps).every(e => e in info))

        if(ready.length == 0){
            if(pending.length > 0) 
                throw new Error("Finished with layers still pending.")
            break;
        }
        
        for(let layer of ready) {
            var deps = {}
            for(let dep in layer.deps){
                deps[dep] = info[layer.deps[dep]].output;
            }

            info[layer.name] = LAYER_TYPES[layer.type](gl, layer, deps, options)
        }
    }
    console.timeEnd('compiling network')
    
    return { network, info };
}


async function run(gl, compiled, options){
    var { network, info } = compiled;

    console.time('running network')
    // reset status of all layers
    for(let layer of network){
        info[layer.name].done = false;
    }

    while(true){
        var pending = network
            .filter(k => !info[k.name].done);

        var ready = pending
            .filter(k => Object.values(k.deps).every(e => info[e].done))

        if(ready.length == 0){
            if(pending.length > 0) throw new Error("Finished with layers still pending.");
            break;
        }
        for(let layer of ready) {
            info[layer.name].run(options)
            info[layer.name].done = true;

            console.log(layer.name, info[layer.name].output.shape)
            var size = info[layer.name].output.texSize;
            if(size[0] * size[1] > 1000){
                info[layer.name].output.show({ scale: 150/255, offset: 0.5, flipY: true })    
                await new Promise(resolve => requestAnimationFrame(resolve))
            }
            
        }
    }
    console.timeEnd('running network')
}

async function destroy(gl, compiled){
    var { network, info } = compiled;

    console.time('destroying network')
    for(let layer of network){
        info[layer.name].destroy()
    }
    console.timeEnd('destroying network')
}

