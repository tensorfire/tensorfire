uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

vec4 process(ivec4 pos);
void main(){
    int tile = vec2tile(ivec2(gl_FragCoord.xy) / @shape.xy, @cols);
    int chunks = ceildiv(@shape.z, 4);
    if(tile >= chunks * @shape.w){ checkerboard(); return; }
    gl_FragColor = activationFunc(process(ivec4(
        mod(gl_FragCoord.xy, vec2(@shape.xy)), 
        tile2vec(tile, chunks) * ivec2(4, 1))));
}