// http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/

vec4 @encode1(float v) {
    vec4 enc = vec4(1.0, 255.0, 65025.0, 160581375.0) * (v / 2048.0 + 0.5);
    enc = fract(enc);
    enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);
    return enc;
}