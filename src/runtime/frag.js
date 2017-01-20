// import { Tensor, OutputTensor, InPlaceTensor } from '../tensor/index.js'
import BaseTensor from '../tensor/base.js'

import { readFileSync } from 'fs';

const TENSOR_FRAGMENT_HEADER = readFileSync(__dirname + '/../format/util.glsl', 'utf8')


export default function assembleFragmentShader(shaderGen, output, uniforms){
    var tensorShader = shaderGen(uniforms, output);
    
    var fragmentShader = TENSOR_FRAGMENT_HEADER;
    for(let uniform in uniforms){
        if(uniforms[uniform] instanceof BaseTensor){
            let tensor = uniforms[uniform];

            fragmentShader += tensor._format.codec.decodeShader.replace(/@/g, uniform + '_') + '\n'
            fragmentShader += tensor._format.pack.readShader.replace(/@/g, uniform + '_') + '\n'

            if((tensor.format.density == '1:4' && (new RegExp(uniform + '_read4\\b')).test(tensorShader)) || 
                (tensor.format.density == '4:4' && (new RegExp(uniform + '_read\\b')).test(tensorShader))){
                fragmentShader += tensor._format.read_shim.replace(/@/g, uniform + '_') + '\n';
            }
        }
    }

    var activation = (typeof uniforms._activation == 'string' && uniforms._activation != 'linear') ?
        uniforms._activation.toLowerCase() : 'linear';

    if(!(activation in output._format.activations))
        throw new Error('Unknown activation type ' + activation);

    fragmentShader += output._format.activations[activation].replace(/@/g, 'out_') + '\n';
    fragmentShader += output._format.codec.encodeShader.replace(/@/g, 'out_') + '\n';
    fragmentShader += output._format.pack.writeShader.replace(/@/g, 'out_') + '\n';


    if((output.format.density == '1:4' && /process4\b/.test(tensorShader)) || 
        (output.format.density == '4:4' && /process\b/.test(tensorShader))){
        fragmentShader += output._format.write_shim.replace(/@/g, 'out_') + '\n';
    }

    fragmentShader += tensorShader 

    // console.log(fragmentShader)

    return fragmentShader;
}