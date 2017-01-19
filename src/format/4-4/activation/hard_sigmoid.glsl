vec4 @activation4(vec4 data){
    return clamp(data * vec4(0.2,0.2,0.2,0.2) + 
        vec4(.5,.5,.5,.5), vec4(0,0,0,0), vec4(1,1,1,1));
}