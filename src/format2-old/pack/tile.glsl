uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

float @readf(ivec4 pos){
    return decode_float(texture2D(@tex, (
        vec2(tile2vec(
            vec2tile(pos.zw, @shape.z)
        , @cols) * ivec2(@shape.xy)) +
        vec2(pos.xy) + vec2(0.5, 0.5)
    ) / vec2(@texSize)));
}

vec4 @read(ivec4 pos){
    int z = 4 * (pos.z / 4);
    return vec4(
        @readf(ivec4(pos.xy, z    , pos.w)),
        @readf(ivec4(pos.xy, z + 1, pos.w)),
        @readf(ivec4(pos.xy, z + 2, pos.w)),
        @readf(ivec4(pos.xy, z + 3, pos.w))
    );
}






uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;


vec4 clampify(vec4 v){
    return vec4(ivec4(clamp(v, vec4(0), vec4(1)) * 255.0)) / 255.0;
}

float processf(ivec4 pos);
void main(){
    int tile = vec2tile(ivec2(gl_FragCoord.xy) / @shape.xy, @cols);
    if(tile >= @shape.z * @shape.w){ checkerboard(); return; }

    gl_FragColor = clampify(encode_float(processf(ivec4(
        mod(vec2(gl_FragCoord.xy), vec2(@shape.xy)), 
        tile2vec(tile, @shape.z)))));
}






uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

vec4 process(ivec4 pos);
void main(){
    int tile = vec2tile(ivec2(gl_FragCoord.xy) / @shape.xy, @cols);
    int chunks = ceildiv(@shape.z, 4);
    if(tile * 4 >= @shape.z * @shape.w){ checkerboard(); return; }
    gl_FragColor = process(ivec4(
        mod(gl_FragCoord.xy, vec2(@shape.xy)), 
        tile2vec(tile, chunks) * ivec2(4, 1)));
}





float processf(ivec4 pos);
vec4 process(ivec4 pos){
    return vec4(
        processf(ivec4(pos.xy, pos.z + 0, pos.w)),
        processf(ivec4(pos.xy, pos.z + 1, pos.w)),
        processf(ivec4(pos.xy, pos.z + 2, pos.w)),
        processf(ivec4(pos.xy, pos.z + 3, pos.w))
    );
}



vec4 process(ivec4 pos);
float processf(ivec4 pos){
    return chsel(process(ivec4(pos.xy, 4 * (pos.z / 4), pos.w)), imod(pos.z, 4));
}

