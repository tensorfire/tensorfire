const SHOW_TEXTURE_VERTEX = `
    attribute vec2 a_position;
    varying mediump vec2 pos;
    void main() {
        pos = (a_position + vec2(1, 1)) / 2.0;
        gl_Position = vec4(a_position, 0, 1);
    }
`

const SHOW_TEXTURE_FRAGMENT = `
    uniform sampler2D tex;
    varying mediump vec2 pos;
    void main() {
        gl_FragColor = vec4(texture2D(tex, pos).rgb, 1);
    }
`

export default function showTexture(gl, tex){
    if(!gl._showProgram){
        gl._showProgram = createShaderProgram(gl, SHOW_TEXTURE_VERTEX, SHOW_TEXTURE_FRAGMENT);
        gl.useProgram(gl._showProgram);
        bindAttributeBuffer(gl, gl._showProgram);
        gl.uniform1i(gl.getUniformLocation(gl._showProgram, 'tex'), 0);
    }
    
    gl.useProgram(gl._showProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
