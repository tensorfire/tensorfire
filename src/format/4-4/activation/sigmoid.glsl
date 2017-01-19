vec4 @activation4(vec4 data){
    return (vec4(1,1,1,1)/(vec4(1,1,1,1) + exp(-2.0 * 
        clamp(data,vec4(-20,-20,-20,-20), vec4(20,20,20,20)) )));
}
