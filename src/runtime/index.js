import getTensorProgram from './program.js'
import assembleFragmentShader from './frag.js'
import { Tensor, OutputTensor, InPlaceTensor } from '../tensor/index.js'
import TNSL from './tnsl.js'


export function Compile(shaderGen, output, uniforms = {}){
    if(!(output instanceof OutputTensor)) 
        throw new Error("First argument must be an instance of OutputTensor");
    
    if(typeof shaderGen === 'string') shaderGen = TNSL(shaderGen);
    
    var gl = output.gl;
    return getTensorProgram(gl, assembleFragmentShader(shaderGen, output, uniforms));
}

export function Run(shaderGen, output, uniforms = {}){
    var tp = Compile(shaderGen, output, uniforms);

    var gl = output.gl;
    gl.useProgram(tp.program);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    var setUniform = tp.setUniform,
        texIndex = 0,
        mustSwap = false;
        
    for(let name in uniforms){
        if(!(name in tp.uniformTypes)) throw new Error("Unknown uniform " + name);
        let value = uniforms[name], 
            type = tp.uniformTypes[name];

        if(type == 'Tensor'){
            if(value === output) mustSwap = true;

            setUniform(name + '.texSize', value.texSize)
            setUniform(name + '.shape', value.shape)
            setUniform(name + '.cols', value.cols)

            gl.activeTexture(gl['TEXTURE' + texIndex]);
            gl.bindTexture(gl.TEXTURE_2D, value.tex);
            setUniform(name + '.tex', texIndex)
            texIndex++
        }else setUniform(name, value);
    }

    // Ordinarily we can't write to the same texture that we're using as
    // an input, as this could lead to all sorts of terrible race conditions,
    // undefined behavior, and invalid state. InPlaceTensors actually consist
    // of a pair of textures which are swapped for these in-place operations. 
    if(mustSwap) output.swap();

    setUniform('_outputShape', output.shape)
    setUniform('_outputCols', output.cols)
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, output.fbo);
    gl.viewport(0, 0, output.texSize[0], output.texSize[1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // draw to framebuffer
    return output;
}