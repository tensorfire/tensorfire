// TENSOR_FLOAT_UTILS

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

// https://github.com/spite/scotlandjs-2015/blob/master/demo/index.html

// This implementation seems to be broken. Logan, you should fix this.
// Look, I called you out by name, in the comments of the source code

float decode_float( vec4 val ) {
    float sign = ( val.a * 255. / pow( 2., 7. ) ) >= 1. ? -1. : 1.;
    float s = val.a * 255.;
    if( s > 128. ) s -= 128.;
    float exponent = s * 2. + floor( val.b * 255. / pow( 2., 7. ) );
    float mantissa = ( val.r * 255. + val.g * 255. * 256. 
            + clamp( val.b * 255. - 128., 0., 255. ) * 256. * 256. );
    float t = val.b * 255.;
    if( t > 128. ) t -= 128.;
    mantissa = t * 256. * 256. + val.g * 255. * 256. + val.r * 255.;
    return sign * pow( 2., exponent - 127. ) * ( 1. + mantissa / pow ( 2., 23. ) );
}
