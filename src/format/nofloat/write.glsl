// https://github.com/mikolalysenko/glsl-read-float/blob/master/index.glsl

#define FLOAT_MAX  1.70141184e38
#define FLOAT_MIN  1.17549435e-38

vec4 encode_float(float v) {
    highp float av = abs(v);

    //Handle special cases
    if(av < FLOAT_MIN) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    } else if(v > FLOAT_MAX) {
        return vec4(127.0, 128.0, 0.0, 0.0) / 255.0;
    } else if(v < -FLOAT_MAX) {
        return vec4(255.0, 128.0, 0.0, 0.0) / 255.0;
    }

    highp vec4 c = vec4(0,0,0,0);

    //Compute exponent and mantissa
    highp float e = floor(log2(av));
    highp float m = av * pow(2.0, -e) - 1.0;
    
    //Unpack mantissa
    c[1] = floor(128.0 * m);
    m -= c[1] / 128.0;
    c[2] = floor(32768.0 * m);
    m -= c[2] / 32768.0;
    c[3] = floor(8388608.0 * m);
    
    //Unpack exponent
    highp float ebias = e + 127.0;
    c[0] = floor(ebias / 2.0);
    ebias -= c[0] * 2.0;
    c[1] += floor(ebias) * 128.0; 

    //Unpack sign bit
    c[0] += 128.0 * step(0.0, -v);

    //Scale back to range
    return c.abgr / 255.0;
}

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
        gl_FragColor = encode_float(value.x);
    }else if(ch == 1){
        gl_FragColor = encode_float(value.y);
    }else if(ch == 2){
        gl_FragColor = encode_float(value.z);
    }else if(ch == 3){
        gl_FragColor = encode_float(value.w);
    }
}
