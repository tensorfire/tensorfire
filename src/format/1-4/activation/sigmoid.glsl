float @activation1(float data){
    return (1.0/(1.0 + exp(-2.0 * 
        clamp(data,-20.0, 20.0) )));
}
