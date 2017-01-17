#ifndef DECODE_FLOAT
#define DECODE_FLOAT

float decode_float(vec4 val){
    vec4 scl = floor(255.0 * val + 0.5);
    float sgn = (scl.a < 128.0) ? 1.0 : -1.0;
    float exn = mod(scl.a * 2.0, 256.0) + floor(scl.b / 128.0) - 127.0;
    float man = 1.0 +
        (scl.r / 8388608.0) + 
        (scl.g / 32768.0) +
        mod(scl.b, 128.0) / 128.0;
    return sgn * man * pow(2.0, exn);
}

#endif
////////////////////////////////

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
    return vec4(
        @readf(ivec4(pos.xy, pos.z * 4 + 0, pos.w)),
        @readf(ivec4(pos.xy, pos.z * 4 + 1, pos.w)),
        @readf(ivec4(pos.xy, pos.z * 4 + 2, pos.w)),
        @readf(ivec4(pos.xy, pos.z * 4 + 3, pos.w))
    );
}