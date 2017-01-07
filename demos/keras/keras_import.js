function import_keras_network(keras_model, keras_model_meta, buffer){
    var network = [];

    function getWeight(name){
        var w = keras_model_meta.find(k => k.weight_name == name);
        console.assert(w.type == 'float32')
        var data = new Float32Array(buffer, w.offset, w.length)
        var array = ndarray(data, w.shape);
        return array;
    }

    // console.log(ndshow(getWeight("batchnormalization_14_beta:0")))

    keras_model.config.layers.forEach(layer => {
        var inbound = []

        function W(name){ return getWeight(layer.name + '_' + name) }

        if(layer.inbound_nodes.length)
            layer.inbound_nodes[0].forEach(node => 
                inbound.push(node[0]));

        if(layer.class_name == 'Convolution2D'){
            console.assert(layer.config.activation == "linear")
            console.assert(layer.config.W_regularizer == null)
            console.assert(layer.config.b_regularizer == null)
            console.assert(layer.config.W_constraint == null)
            console.assert(layer.config.b_constraint == null)
            console.assert(layer.config.dim_ordering == 'tf')

            console.assert(ndops.norm1(W('b:0')) < 1e-5) // bias must be zero
            network.push({
                name: layer.name,
                type: 'Convolve2D',
                subsample: layer.config.subsample,
                border_mode: layer.config.border_mode,
                kernel: W('W:0'),
                deps: {
                    image: inbound[0]
                },
                _keras: layer
            })
        }else if(layer.class_name == 'Deconvolution2D'){
            console.assert(ndops.norm1(W('b:0')) < 1e-5) // bias must be zero
            console.assert(layer.config.dim_ordering == 'tf')

            network.push({
                name: layer.name,
                type: 'Deconvolve2D',
                kernel: W('W:0'),
                subsample: layer.config.subsample,
                padding: [2, 2],
                deps: {
                    image: inbound[0]
                },
                _keras: layer
            })
        }else if(layer.class_name == 'MaxPooling2D'){
            console.assert(layer.config.dim_ordering == 'tf')
            network.push({
                name: layer.name,
                type: 'MaxPooling2D',
                border_mode: layer.config.border_mode,
                pool_size: layer.config.pool_size,
                strides: layer.config.strides,
                deps: { image: inbound[0] },
                _keras: layer
            })
        }else if(layer.class_name == 'AveragePooling2D'){
            console.assert(layer.config.dim_ordering == 'tf')
            network.push({
                name: layer.name,
                type: 'AveragePooling2D',
                border_mode: layer.config.border_mode,
                pool_size: layer.config.pool_size,
                strides: layer.config.strides,
                deps: { image: inbound[0] },
                _keras: layer
            })
        }else if(layer.class_name == 'ZeroPadding2D'){
            network.push({
                name: layer.name,
                type: 'ZeroPadding2D',
                deps: { image: inbound[0] },
                padding: layer.config.padding,
                _keras: layer
            })
        }else if(layer.class_name == 'Dense'){
            // not really sure about this one,
            // console.assert(ndops.norm1(W('b:0')) < 1e-5)

            network.push({
                name: layer.name,
                type: 'ChannelFullyConnected',
                deps: { image: inbound[0] },
                bias: W('b:0'),
                weights: W('W:0'),
                _keras: layer
            })
        }else if(layer.class_name == 'Merge'){
            console.assert(inbound.length == 2)
            if(layer.config.mode == "sum"){
                network.push({
                    name: layer.name,
                    type: 'Sum',
                    deps: {
                        a: inbound[0],
                        b: inbound[1],  
                    },
                    _keras: layer
                })
            }else if(layer.config.mode == "concat" && layer.config.concat_axis === 3){
                network.push({
                    name: layer.name,
                    type: 'ConcatChannel',
                    deps: {
                        a: inbound[0],
                        b: inbound[1],  
                    },
                    _keras: layer
                })
            }else{
                throw new Error("unsupported merge mode")
            }
        }else if(layer.class_name == 'BatchNormalization'){
            network.push({
                name: layer.name + '_mean',
                type: 'ComputeMean',
                deps: {
                    image: inbound[0]
                }
            }, {
                name: layer.name + '_residual',
                type: 'SquaredResidual',
                deps: {
                    image: inbound[0],
                    mean: layer.name + '_mean', 
                }
            }, {
                name: layer.name + '_variance',
                type: 'ComputeMean',
                deps: {
                    image: layer.name + '_residual',    
                }
            }, {
                name: layer.name,
                type: 'BatchNormalize',
                deps: {
                    image: inbound[0],
                    mean: layer.name + '_mean',
                    variance: layer.name + '_variance',
                },
                beta: W('beta:0'),
                gamma: W('gamma:0')
            });
        }else if(layer.class_name == 'Activation'){
            if(layer.config.activation == 'softmax'){
                network.push({
                    name: layer.name,
                    type: 'Identity',
                    deps: { image: inbound[0] },
                    _keras: layer
                })
            }else{
                network.push({
                    name: layer.name,
                    type: 'Activation',
                    activation: layer.config.activation,
                    deps: {
                        image: inbound[0],
                    },
                    _keras: layer
                })
            }
        }else if(layer.class_name == 'InputLayer'){
            network.push({
                name: layer.name,
                type: 'InputLayer',
                deps: { },
                _keras: layer
            })
        }else if(layer.class_name == 'Dropout' || layer.class_name == 'Flatten'){
            network.push({
                name: layer.name,
                type: 'Identity',
                deps: { image: inbound[0] },
                _keras: layer
            })
        }else if(layer.class_name == "GlobalAveragePooling2D"){
            network.push({
                name: layer.name,
                type: 'ComputeMean',
                deps: { image: inbound[0] },
                _keras: layer
            })
        }else{
            console.error(layer, keras_model_meta.filter(k => k.layer_name == layer.name))
        }
    })

    function rename(oldName, newName){
        for(let layer of network){
            if(layer.name == oldName) layer.name = newName;
            for(let dep in layer.deps){
                if(layer.deps[dep] == oldName) layer.deps[dep] = newName;
            }
        }
    }

    // elide activations
    for(let layer of network){
        if(layer.type != 'Activation') continue;
        // make sure nothing else depends on its input
        if(network.some(k => k !== layer && Object.values(k.deps).includes(layer.deps.image) ))
            continue;
        var input = network.find(k => k.name == layer.deps.image);
        // make sure input does not already have an attached activation
        if(input.activation) continue;
        // remove this thing
        network.splice(network.indexOf(layer), 1);
        // rename the input and set the activation
        var new_name = input.name + '+' + layer.name;
        input.name = layer.name;
        input.activation = layer.activation;
        rename(input.name, new_name)
    }

    // remove dropout and stuff
    for(let layer of network){
        if(layer.type != 'Identity') continue;
        network.splice(network.indexOf(layer), 1);
        rename(layer.name, layer.deps.image);
    }

    return network
}