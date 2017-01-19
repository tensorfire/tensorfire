float @read(ivec4 pos){
    return chsel(@read4(pos), imod(pos.z, 4));
}
