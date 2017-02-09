function decode_float( val ) {
    var sign = ( val[3] * 255. / Math.pow( 2., 7. ) ) >= 1. ? -1. : 1.;
    console.log('sign', sign)
    var s = val[3] * 255.;
    console.log('s', s)
    if( s > 128. ) s -= 128.;
    console.log('s', s)
    var exponent = s * 2. + Math.floor( val[2] * 255. / Math.pow( 2., 7. ) );
    console.log('exp', exponent)
    var mantissa = ( val[0] * 255. + val[1] * 255. * 256. 
            + clamp( val[2] * 255. - 128., 0., 255. ) * 256. * 256. );
    console.log('mantissa', mantissa)
    var t = val[2] * 255.;
    console.log('t', t)
    if( t > 128. ) t -= 128.;
    console.log('t', t)
    mantissa = t * 256. * 256. + val[1] * 255. * 256. + val[0] * 255.;
    console.log('mantissa', mantissa)
    return sign * Math.pow( 2., exponent - 127. ) * ( 1. + mantissa / Math.pow ( 2., 23. ) );
}


function decode_float(val){
    val = val.map(k => k * 255)
    var sign = (val[3] >> 7) ? -1 : 1;
    console.log('sign', sign)
    var exp = (((val[3] & 0b01111111) << 1) | (val[2] >> 7)) - 127;
    console.log('exponent', exp)
    // var mantissa = ( val[0] * 255. + val[1] * 255. * 256. 
    //         + clamp( val[2] * 255. - 128., 0., 255. ) * 256. * 256. );
    // console.log('mantissa', mantissa)

    var _m = 0;
    _m += val[0] / 8388608.0;
    _m += val[1] / 32768.0;
    _m += (val[2] % 128) / 128.0;

    console.log('mantissa', _m)

    // Math.pow(2, exp) * 

    // var m = av * Math.pow(2.0, -e) - 1.0;
    // m + 1 = av * Math.pow(2, -e)

    var av = (_m + 1) * Math.pow(2, exp)
    // av = 1 + m / pow(2, e)

    // console.log('av', av)

}


function decode_float(val){
    val = val.map(k => k * 255)
    var sign = (val[3] >> 7) ? -1 : 1;
    var exp = (((val[3] & 0b01111111) << 1) | (val[2] >> 7)) - 127;
    var _m = 0;
    _m += val[0] / 8388608.0;
    _m += val[1] / 32768.0;
    _m += (val[2] % 128) / 128.0;
    var av = (_m + 1) * Math.pow(2, exp)
    return sign * av;
}

function decode_float(val){
    val = val.map(k => k * 255)
    // var sign = (val[3] >> 7) ? -1 : 1;

    var sign = val[3] < 128 ? 1 : -1;

    // val[3]

    // var ebias = 0;
    // ebias += c[1] / 128.0;
    // ebias 



    // var ebias = e + 127.0;
    // c[0] = Math.floor(ebias / 2.0);
    // ebias -= c[0] * 2.0;
    // c[1]/ 128.0 += Math.floor(ebias) ; 




    // var exp = ((val[3] * 2.0) % 256) + (val[2] / 128) - 127;

    var exp = ((val[3] * 2) % 256) + Math.floor(val[2] / 128) - 127;

    // var exp = (((val[3] & 0b01111111) << 1) | (val[2] >> 7)) - 127;


    var _m = 0;
    _m += val[0] / 8388608.0;
    _m += val[1] / 32768.0;
    _m += (val[2] % 128) / 128.0;
    var av = (_m + 1) * Math.pow(2, exp)
    return sign * av;
}



function decode_float(val){
    val = val.map(k => Math.round(k * 255))

    var sign = val[3] < 128 ? 1 : -1;
    var exp = ((val[3] * 2) % 256) + Math.floor(val[2] / 128) - 127;

    var mantissa = 1 +
        val[0] / 8388608.0 + 
        val[1] / 32768.0 +
        (val[2] % 128) / 128.0;

    return sign * mantissa * Math.pow(2, exp)
}



function decode_float(val){
    var scl = val.map(k => Math.floor(255.0 * k + 0.5));
    var sgn = (scl[3] < 128.0) ? 1.0 : -1.0;
    var exn = ((scl[3] * 2.0) % 256.0) + Math.floor(scl[2] / 128.0) - 127.0;
    var man = 1.0 +
        (scl[0] / 8388608.0) + 
        (scl[1] / 32768.0) +
        (scl[2] % 128.0) / 128.0;
    return sgn * man * Math.pow(2.0, exn);
}

function decode_float(val){
    var scl = val.map(k => Math.floor(255.0 * k + 0.5));
    var sgn = (scl[3] < 128.0) ? 1.0 : -1.0;
    var exn = ((scl[3] * 2.0) % 256.0) + Math.floor(scl[2] / 128.0) - 127.0;
    var man = 1.0 +
        (scl[0] / 8388608.0) + 
        (scl[1] / 32768.0) +
        (scl[2] % 128.0) / 128.0;
    return sgn * man * Math.pow(2.0, exn);
}

function clamp(val, min, max){
    return Math.max(min, Math.min(max, val))
}

function step(edge, x){
    return x < edge ? 0 : 1;
}

function encode_float(v) {
    var av = Math.abs(v);

    if(av < 1.17549435e-38) {
        return [0.0, 0.0, 0.0, 0.0]
    } else if(v > 1.70141184e38) {
        return [127.0, 128.0, 0.0, 0.0].map(k => k / 255.0)
    } else if(v < -1.70141184e38) {
        return [255.0, 128.0, 0.0, 0.0].map(k => k / 255.0)
    }
    // console.log(':av', av)

    var c = [0,0,0,0];
    //Compute exponent and mantissa
    var e = Math.floor(Math.log2(av));
    // console.log(':exponent', e)
    var m = av * Math.pow(2.0, -e) - 1.0;

    // console.log("::av", (m + 1) * Math.pow(2, e))

    // console.log(':mantissa', m)
    //Unpack mantissa
    c[1] = Math.floor(128.0 * m);
    m -= c[1] / 128.0;
    c[2] = Math.floor(32768.0 * m);
    m -= c[2] / 32768.0;
    c[3] = Math.floor(8388608.0 * m);
    

    // var _m = 0;
    // _m += c[3] / 8388608.0;
    // _m += c[2] / 32768.0;
    // _m += c[1] / 128.0;

    // console.log('::mantissa', _m)

    // console.log('rem', m)

    //Unpack exponent
    var ebias = e + 127.0;
    c[0] = Math.floor(ebias / 2.0);
    ebias -= c[0] * 2.0;
    c[1] += Math.floor(ebias) * 128.0; 

    //Unpack sign bit
    c[0] += 128.0 * step(0.0, -v);

    //Scale back to range
    return c.reverse().map(k => k / 255.0);
}


// 16777216
for(var x = -16777220; x < 16777220; x++){
    if(decode_float(encode_float(x))-x != 0){
        console.log(x)
    }
}