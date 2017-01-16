import { bindAttributeBuffer, createShaderProgram } from '../runtime/program.js'
import { makeFrameBuffer, makeTexture } from './helpers.js'

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
