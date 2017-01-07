import { bindAttributeBuffer, createShaderProgram } from '../runtime/program.js'

const SHOW_TEXTURE_VERTEX = `
    attribute vec2 a_position;
    varying mediump vec2 pos;
    void main() {
        pos = (a_position + vec2(1, 1)) / 2.0;
        gl_Position = vec4(a_position, 0, 1);
    }
`

const SHOW_TEXTURE_FRAGMENT = `
    precision mediump float;

    uniform sampler2D tex;
    uniform float scale;
    uniform float offset;
    uniform bool transpose;
    uniform bool flipX;
    uniform bool flipY;
    uniform int channels;

    varying vec2 pos;

    vec4 colormap(float x) {
        float r = clamp(8.0 / 3.0 * x, 0.0, 1.0);
        float g = clamp(8.0 / 3.0 * x - 1.0, 0.0, 1.0);
        float b = clamp(4.0 * x - 3.0, 0.0, 1.0);
        return vec4(r, g, b, 1.0);
    }

    void main() {
        vec2 p = pos;
        if(flipX) p.x = 1.0 - p.x;
        if(flipY) p.y = 1.0 - p.y;
        if(transpose) p = p.yx;
        if(channels == 4){
            gl_FragColor = vec4(vec4(offset, offset, offset, offset) 
                + scale * texture2D(tex, p));
        }else if(channels == 3){
            gl_FragColor = vec4(vec3(offset, offset, offset) 
                + scale * texture2D(tex, p).rgb, 1);
        }else if(channels == 2){
            gl_FragColor = vec4(vec2(offset, offset) 
                + scale * texture2D(tex, p).rg, 0, 1);
        }else if(channels == 1){
            gl_FragColor = colormap(offset + scale * texture2D(tex, p).r);
        }
    }
`

export default function showTexture(gl, tex, opt = {}){
    if(!gl._showProgram){
        gl._showProgram = createShaderProgram(gl, SHOW_TEXTURE_VERTEX, SHOW_TEXTURE_FRAGMENT);
        gl.useProgram(gl._showProgram);
        bindAttributeBuffer(gl, gl._showProgram);
        gl.uniform1i(gl.getUniformLocation(gl._showProgram, 'tex'), 0);
    }
    
    gl.useProgram(gl._showProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1f(gl.getUniformLocation(gl._showProgram, 'scale'), opt.scale || 1)
    gl.uniform1f(gl.getUniformLocation(gl._showProgram, 'offset'), opt.offset || 0)
    gl.uniform1i(gl.getUniformLocation(gl._showProgram, 'transpose'), opt.transpose ? 1 : 0)
    gl.uniform1i(gl.getUniformLocation(gl._showProgram, 'flipX'), opt.flipX ? 1 : 0)
    gl.uniform1i(gl.getUniformLocation(gl._showProgram, 'flipY'), opt.flipY ? 1 : 0)
    gl.uniform1i(gl.getUniformLocation(gl._showProgram, 'channels'), opt.channels || 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
