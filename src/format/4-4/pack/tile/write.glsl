uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

vec4 process4(ivec4 pos);
void main(){
    int tile = vec2tile(ivec2(gl_FragCoord.xy) / @shape.xy, @cols);
    int chunks = ceildiv(@shape.z, 4);
    if(tile * 4 >= @shape.z * @shape.w){ checkerboard(); return; }
    gl_FragColor = @encode4(@activation4(process4(ivec4(
        mod(gl_FragCoord.xy, vec2(@shape.xy)), 
        tile2vec(tile, chunks) * ivec2(1, 4)))));
}

