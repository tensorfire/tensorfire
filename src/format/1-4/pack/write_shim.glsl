vec4 process4(ivec4 pos);
float process(ivec4 pos){
    return chsel(process4(ivec4(pos.xy, 4 * (pos.z / 4), pos.w)), imod(pos.z, 4));
}