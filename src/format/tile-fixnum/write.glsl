#ifndef ENCODE_FIXNUM
#define ENCODE_FIXNUM

// http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/

vec4 encode_fixnum(float v) {
    vec4 enc = vec4(1.0, 255.0, 65025.0, 160581375.0) * v;
    enc = fract(enc);
    enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);
    return enc;
}

#endif
////////////////////////////////

uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

vec4 process(ivec4 pos);
void main(){
    int x = int(gl_FragCoord.x) / 4;

    int tile = vec2tile(ivec2(x, gl_FragCoord.y) / @shape.xy, @cols);
    int chunks = ceildiv(@shape.z, 4);
    if(tile >= chunks * @shape.w){ checkerboard(); return; }

    vec4 value = activationFunc(process(ivec4(
        mod(vec2(x, gl_FragCoord.y), vec2(@shape.xy)), 
        tile2vec(tile, chunks))));
    
    int ch = imod(int(gl_FragCoord.x), 4);
    if(ch == 0){
        gl_FragColor = encode_fixnum(value.x);
    }else if(ch == 1){
        gl_FragColor = encode_fixnum(value.y);
    }else if(ch == 2){
        gl_FragColor = encode_fixnum(value.z);
    }else if(ch == 3){
        gl_FragColor = encode_fixnum(value.w);
    }
}
