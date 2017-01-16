// import { Tensor, OutputTensor, InPlaceTensor } from '../tensor/index.js'
import BaseTensor from '../tensor/base.js'

import { readFileSync } from 'fs';

import ACTIVATIONS from './activations.js'


// const TENSOR_FRAGMENT_HEADER = readFileSync(__dirname + '/glsl/frag_header.glsl', 'utf8');
// const READ_TENSOR_NORMAL = readFileSync(__dirname + '/glsl/read_normal.glsl', 'utf8')
// const READ_TENSOR_NOFLOAT = readFileSync(__dirname + '/glsl/read_nofloat.glsl', 'utf8')
// const WRITE_TENSOR_NORMAL = readFileSync(__dirname + '/glsl/write_normal.glsl', 'utf8')
// const WRITE_TENSOR_NOFLOAT = readFileSync(__dirname + '/glsl/write_nofloat.glsl', 'utf8')
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


    console.log('assembling', tensorShader, output, uniforms, fragmentShader)
    // var nofloats = Object.keys(uniforms)
    //     .map(k => uniforms[k])
    //     .filter(k => k instanceof Tensor)
    //     .map(k => !!k.nofloat)

    // if(nofloats.some(k => k != nofloats[0]))
    //     throw new Error("Heterogeneous NOFLOAT parameters not supported.");

    // var shaderBody = '';
    // shaderBody += output.nofloat ? WRITE_TENSOR_NOFLOAT : WRITE_TENSOR_NORMAL;
    // shaderBody += nofloats[0] ? READ_TENSOR_NOFLOAT : READ_TENSOR_NORMAL;
    // shaderBody += tensorShader;
    
    // var fragmentShader = TENSOR_FRAGMENT_HEADER;

    

    // if(/encode_float|decode_float/.test(shaderBody))
    //     fragmentShader += TENSOR_FLOAT_UTILS;
    // fragmentShader += shaderBody;

    return fragmentShader;
}