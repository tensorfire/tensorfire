// WRITE_TENSOR_NORMAL

void main(){
    int tile = vec2tile(ivec2(gl_FragCoord.xy) / _outputShape.xy, _outputCols);
    int chunks = ceildiv(_outputShape.z, 4);
    if(tile >= chunks * _outputShape.w){
        // draw a checkerboard, rather than have the gpu just spit out random noise
        gl_FragColor = vec4(mod(gl_FragCoord.x - gl_FragCoord.y, 2.0), 0.2, 0.1, 1);
        return;
    }
    gl_FragColor = activationFunc(process(ivec4(
        mod(gl_FragCoord.xy, vec2(_outputShape.xy)), 
        tile2vec(tile, chunks))));
}
