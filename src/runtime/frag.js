// import { Tensor, OutputTensor, InPlaceTensor } from '../tensor/index.js'
import BaseTensor from '../tensor/base.js'

import { readFileSync } from 'fs';

import ACTIVATIONS from './activations.js'
const TENSOR_FRAGMENT_HEADER = readFileSync(__dirname + '/../format/util.glsl', 'utf8')

export default function assembleFragmentShader(shaderGen, output, uniforms){
    var tensorShader = shaderGen(uniforms, output);
    
    var fragmentShader = TENSOR_FRAGMENT_HEADER;

    for(let uniform in uniforms){
        if(uniforms[uniform] instanceof BaseTensor){
            let tensor = uniforms[uniform];

            fragmentShader += tensor._format.readShader.replace(/@/g, uniform + '_');
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

    fragmentShader += tensorShader 

    return fragmentShader;
}