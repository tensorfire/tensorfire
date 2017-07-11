import { bindAttributeBuffer, createShaderProgram } from '../runtime/program.js'
import { makeFrameBuffer, makeTexture } from './helpers.js'

export default function runFeatureTests(gl){
    // gl.NO_FLOAT_TEXTURES = true;
    
    if(!gl.FLOAT_TEXTURES_TESTED && !gl.NO_FLOAT_TEXTURES){
        if(!gl.getExtension('OES_texture_float')){
            console.info("This browser does not seem to support OES_texture_float. "
                + "Using float codec workaround from now on.")
            gl.NO_FLOAT_TEXTURES = true;
        }
        gl.FLOAT_TEXTURES_TESTED = true;
    }

    if(!gl.NO_FLOAT_TEXTURES){
        if(!gl.RENDER_FLOAT_TESTED && !gl.NO_RENDER_FLOAT){
            if(!testRenderFloat(gl)){
                console.info("This browser supports OES_texture_float, " + 
                    "but can not render to floating textures. " + 
                    "Using float codec workaround for output tensors from now on.")
                gl.NO_RENDER_FLOAT = true;
            }
            gl.RENDER_FLOAT_TESTED = true;
        }

        if(!gl.READ_FLOAT_TESTED && !gl.NO_READ_FLOAT && !gl.NO_READ_FLOAT){
            if(!testReadFloat(gl)){
                console.info("This browser supports OES_texture_float, " + 
                    "can render to floating point textures, but can not " +
                    "read into a Float32Array buffer. Using float codec " +
                    "workaround for reading from output tensors from now on.")
                gl.NO_READ_FLOAT = true;
            }
            gl.READ_FLOAT_TESTED = true;
        }
    }


}


const CHECK_FLOAT_VERTEX = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0, 1);
    }
`
const CHECK_FLOAT_FRAGMENT = `
    void main() {
        gl_FragColor = vec4(3.14159, -2.71828, 1.61828, 42);
    }
`;

// some browsers (e.g. mobile safari) are capable of initializing floating 
// point textures but unable to write to them. The only way of finding this
// out is by trying to render to a floating point texture and noticing
// the invalid framebuffer status.

export function testRenderFloat(gl){
    var tex = makeTexture(gl)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 10, 10, 0, gl.RGBA, gl.FLOAT, null);
    var fbo = makeFrameBuffer(gl, tex);

    var program = createShaderProgram(gl, CHECK_FLOAT_VERTEX, CHECK_FLOAT_FRAGMENT);
    gl.useProgram(program);
    bindAttributeBuffer(gl, program);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, 10, 10);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.deleteTexture(tex)
    gl.deleteFramebuffer(fbo)
    gl.deleteProgram(program)

    return status == gl.FRAMEBUFFER_COMPLETE;
}


function testReadFloat(gl){
    var tex = makeTexture(gl)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 10, 10, 0, gl.RGBA, gl.FLOAT, null);
    var fbo = makeFrameBuffer(gl, tex);

    var program = createShaderProgram(gl, CHECK_FLOAT_VERTEX, CHECK_FLOAT_FRAGMENT);
    gl.useProgram(program);
    bindAttributeBuffer(gl, program);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, 10, 10);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    var size = [3, 3];
    var pixels = pixels = new Float32Array(size[0] * size[1] * 4)
    gl.readPixels(0, 0, size[0], size[1], gl.RGBA, gl.FLOAT, pixels);

    gl.deleteTexture(tex)
    gl.deleteFramebuffer(fbo)
    gl.deleteProgram(program)


    var total_error = Math.abs(pixels[0] - 3.14159) +
            Math.abs(pixels[1] + 2.71828) +
            Math.abs(pixels[2] - 1.61828) +
            Math.abs(pixels[3] - 42);

    return total_error < 0.01;
}
