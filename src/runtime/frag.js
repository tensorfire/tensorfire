// import { Tensor, OutputTensor, InPlaceTensor } from '../tensor/index.js'
import BaseTensor from '../tensor/base.js'

import { readFileSync } from 'fs';

import ACTIVATIONS from './activations.js'
const TENSOR_FRAGMENT_HEADER = readFileSync(__dirname + '/../format/util.glsl', 'utf8')
const TENSOR_PROCESSF = `
float processf(ivec4 pos);
vec4 process(ivec4 pos){
    return vec4(
        processf(ivec4(pos.xy, pos.z + 0, pos.w)),
        processf(ivec4(pos.xy, pos.z + 1, pos.w)),
        processf(ivec4(pos.xy, pos.z + 2, pos.w)),
        processf(ivec4(pos.xy, pos.z + 3, pos.w))
    );
}

`

const TENSOR_UNPROCESSF = `
vec4 process(ivec4 pos);
float processf(ivec4 pos){
    return chsel(process(ivec4(pos.xy, 4 * (pos.z / 4), pos.w)), imod(pos.z, 4));
}

`;


export default function assembleFragmentShader(shaderGen, output, uniforms){
    var tensorShader = shaderGen(uniforms, output);
    
    var fragmentShader = TENSOR_FRAGMENT_HEADER;
    for(let uniform in uniforms){
        if(uniforms[uniform] instanceof BaseTensor){
            let tensor = uniforms[uniform];

            fragmentShader += tensor._format.codec.decodeShader.replace(/@/g, uniform + '_') + '\n'
            fragmentShader += tensor._format.pack.readShader.replace(/@/g, uniform + '_') + '\n\n'

        }
    }

    var activation = (typeof uniforms._activation == 'string' && uniforms._activation != 'linear') ?
        uniforms._activation.toLowerCase() : 'linear';

    if(!(activation in output._format.activations))
        throw new Error('Unknown activation type ' + activation);

    fragmentShader += output._format.activations[activation].replace(/@/g, 'out_');
    fragmentShader += output._format.codec.encodeShader.replace(/@/g, 'out_');
    fragmentShader += output._format.pack.writeShader.replace(/@/g, 'out_');


    if((output.format.density == '1:4' && /process4\b/.test(tensorShader)) || 
        (output.format.density == '4:4' && /process\b/.test(tensorShader))){

        fragmentShader += output._format.write_shim;
    }

    fragmentShader += tensorShader 

    console.log(fragmentShader)

    return fragmentShader;
}