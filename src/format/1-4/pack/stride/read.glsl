uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform vec4 @stride;


float @read(ivec4 pos){
    int tile = int(dot(vec4(pos), @stride));
    return @decode1(texture2D(@tex,
        (vec2(0.5, 0.5) + vec2(tile2vec(tile, @texSize.x))) 
        / vec2(@texSize)));
}