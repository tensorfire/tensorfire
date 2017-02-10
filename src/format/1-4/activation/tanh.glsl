float @activation1(float data){
    float e = exp(2.0 * clamp(data, -20.0, 20.0) );
    return (e-1.0)/(e+1.0);
}