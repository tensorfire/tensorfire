async function compile(gl, network, options){
    var info = {}

    console.time('compiling network')
    var finished = 0;
    console.groupCollapsed('compiling')
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

            console.log(layer.name, layer, deps)
            info[layer.name] = LAYER_TYPES[layer.type](gl, layer, deps, options)
            info[layer.name].deps = deps
            finished++;
            if(options.progress) await options.progress(finished / network.length, layer);
        }
    }
    console.groupEnd('compiling')
    console.timeEnd('compiling network')
    
    return { network, info };
}


async function run(gl, compiled, options){
    var { network, info } = compiled;

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
            if(options.layerPause){
                var size = info[layer.name].output.info.texSize;
                if(size[0] * size[1] > 1000){ 
                
                // info[layer.name].output.show({ scale: 1, offset: 0 });
                    gl.flush()
                    info[layer.name].output.show({ scale: 150/255, offset: 0.5 });
                    await new Promise(resolve => requestAnimationFrame(resolve))
                }
                // await new Promise(resolve => setTimeout(resolve, 1000))
                // return
                // if(layer.name == 'batchnormalization_1_mean') return;
                // if(layer.name == 'convolution2d_2') return;
                
            }

            // info[layer.name].output.show({ scale: 150/255, offset: 0.5, flipY: true });
            // await new Promise(resolve => requestAnimationFrame(resolve))
            // await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }
}

async function destroy(gl, compiled){
    var { network, info } = compiled;

    console.time('destroying network')
    for(let layer of network){
        info[layer.name].destroy()
    }
    console.timeEnd('destroying network')
}

