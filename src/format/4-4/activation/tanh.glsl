vec4 @activation44(vec4 data){
    vec4 e = exp(2.0 * clamp(data, vec4(-20,-20,-20,-20), vec4(20,20,20,20)) );
    return (e-vec4(1, 1, 1, 1))/(e+vec4(1, 1, 1, 1));
}