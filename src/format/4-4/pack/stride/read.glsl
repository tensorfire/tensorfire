uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform vec4 @stride;


vec4 @read4(ivec4 pos){
    int tile = int(dot(vec4(pos), @stride));
    return @decode4(texture2D(@tex,
        (vec2(0.5, 0.5) + vec2(tile2vec(tile, @texSize.x))) 
        / vec2(@texSize)));
}