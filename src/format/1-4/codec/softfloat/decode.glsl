// TODO: compare with http://stackoverflow.com/a/7237286

float @decode1(vec4 val){
    vec4 scl = floor(255.0 * val + 0.5);
    float sgn = (scl.a < 128.0) ? 1.0 : -1.0;
    float exn = mod(scl.a * 2.0, 256.0) + floor(scl.b / 128.0) - 127.0;
    float man = 1.0 +
        (scl.r / 8388608.0) + 
        (scl.g / 32768.0) +
        mod(scl.b, 128.0) / 128.0;
    return sgn * man * pow(2.0, exn);
}
