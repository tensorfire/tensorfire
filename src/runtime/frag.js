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

            fragmentShader += tensor._format.readShader.replace(/@/g, uniform + '_') + '\n\n';
        }
    }

    var activation = '\n#define activationFunc\n';
    if(typeof uniforms._activation == 'string' && uniforms._activation != 'linear'){
        if(!(uniforms._activation.toLowerCase() in ACTIVATIONS)) 
            throw new Error('Unknown activation type ' + uniforms._activation.toLowerCase());
        activation = ACTIVATIONS[uniforms._activation.toLowerCase()]
    }
    fragmentShader += activation;
    fragmentShader += output._format.writeShader.replace(/@/g, 'out_');

    if(/float processf/.test(tensorShader) && !/float processf/.test(fragmentShader)){
        fragmentShader += TENSOR_PROCESSF;
    }else if(/vec4 process\b/.test(tensorShader) && !/vec4 process\b/.test(fragmentShader)){
        fragmentShader += TENSOR_UNPROCESSF;
    }


    fragmentShader += tensorShader 

    return fragmentShader;
}