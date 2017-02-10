float @activation1(float data){
    return clamp(data * 0.2 + 0.5, 0.0, 1.0);
}