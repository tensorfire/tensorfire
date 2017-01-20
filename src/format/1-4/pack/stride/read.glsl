uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;

float @read(ivec4 pos){
    int tile  = pos.x + 
                pos.y * @shape.x + 
                pos.z * @shape.x * @shape.y +
                pos.w * @shape.x * @shape.y * @shape.z;

    return @decode1(texture2D(@tex, 
        (vec2(tile2vec(tile, @texSize.x)) + vec2(0.5, 0.5)) / vec2(@texSize)));
}
