// WRITE_TENSOR_NOFLOAT

void main(){
    int x = int(gl_FragCoord.x) / 4;

    int tile = vec2tile(ivec2(x, gl_FragCoord.y) / _outputShape.xy, _outputCols);
    int chunks = ceildiv(_outputShape.z, 4);
    if(tile >= chunks * _outputShape.w){
        // draw a checkerboard, rather than have the gpu just spit out random noise
        gl_FragColor = vec4(mod(gl_FragCoord.x - gl_FragCoord.y, 2.0), 0.2, 0.1, 1);
        return;
    }
    vec4 value = activationFunc(process(ivec4(
        mod(vec2(x, gl_FragCoord.y), vec2(_outputShape.xy)), 
        tile2vec(tile, chunks))));
    
    int ch = imod(int(gl_FragCoord.x), 4);
    if(ch == 0){
        gl_FragColor = encode_float(value.x);
    }else if(ch == 1){
        gl_FragColor = encode_float(value.y);
    }else if(ch == 2){
        gl_FragColor = encode_float(value.z);
    }else if(ch == 3){
        gl_FragColor = encode_float(value.w);
    }
}
