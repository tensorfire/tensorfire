uniform Tensor image;

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

vec4 process(ivec4 pos) {
    vec4 color = readTensor(image, ivec4(pos.x / 4, pos.yzw));
    int channel = imod(pos.x, 4);
    if(channel == 0){
        return encode_float(color.r);
    }else if(channel == 1){
        return encode_float(color.g);
    }else if(channel == 2){
        return encode_float(color.b);
    }else if(channel == 3){
        return encode_float(color.a);
    }
}