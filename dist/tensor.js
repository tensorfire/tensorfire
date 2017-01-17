(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.KV = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.pack = pack;
exports.unpack = unpack;
var readShader = exports.readShader = '#ifndef DECODE_FIXNUM\n#define DECODE_FIXNUM\n// http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/\nfloat decode_fixnum( vec4 rgba ) {\n    return (dot( rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/160581375.0) ) - 0.5) * 2048.0;\n}\n\n\n#endif\n////////////////////////////////\n\nuniform sampler2D @tex;\nuniform ivec2 @texSize;\nuniform ivec4 @shape;\nuniform int @cols;\n\nfloat @readf(ivec4 pos){\n    return decode_fixnum(texture2D(@tex, (\n        vec2(tile2vec(\n            vec2tile(pos.zw, @shape.z)\n        , @cols) * ivec2(@shape.xy)) +\n        vec2(pos.xy) + vec2(0.5, 0.5)\n    ) / vec2(@texSize)));\n}\n\nvec4 @read(ivec4 pos){\n    return vec4(\n        @readf(ivec4(pos.xy, pos.z * 4 + 0, pos.w)),\n        @readf(ivec4(pos.xy, pos.z * 4 + 1, pos.w)),\n        @readf(ivec4(pos.xy, pos.z * 4 + 2, pos.w)),\n        @readf(ivec4(pos.xy, pos.z * 4 + 3, pos.w))\n    );\n}';
var writeShader = exports.writeShader = '#ifndef ENCODE_FIXNUM\n#define ENCODE_FIXNUM\n\n// http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/\n\nvec4 encode_fixnum(float v) {\n    vec4 enc = vec4(1.0, 255.0, 65025.0, 160581375.0) * (v / 2048.0 + 0.5);\n    enc = fract(enc);\n    enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);\n    return enc;\n}\n#endif\n////////////////////////////////\n\nuniform ivec2 @texSize;\nuniform ivec4 @shape;\nuniform int @cols;\n\n\nfloat process(ivec4 pos);\nvoid main(){\n    int tile = vec2tile(ivec2(gl_FragCoord.xy) / @shape.xy, @cols);\n    if(tile >= @shape.z * @shape.w){ checkerboard(); return; }\n\n    gl_FragColor = encode_fixnum(process(ivec4(\n        mod(vec2(gl_FragCoord.xy), vec2(@shape.xy)), \n        tile2vec(tile, @shape.z))));\n}\n\n\n\n';

function init(shape) {
  var width = shape[0];
  // we pick the number of columns so we can keep
  // the texture as square as possible, with the
  // minimal amount of wasted space.

  var tiles = shape[2] * shape[3],
      cols = Math.max(1, Math.min(tiles, Math.ceil(Math.sqrt(shape[0] * shape[1] * tiles) / width)));

  var texSize = [width * cols, shape[1] * Math.ceil(tiles / cols)];

  return {
    texSize: texSize,
    cols: cols,
    shape: shape
  };
}

function pack(info, ndarray) {
  // return Uint8Array or Float32Array


  // uniform sampler2D @_tex;
  // uniform ivec2 @_texSize;
  // uniform ivec4 @_shape;
  // uniform int @_cols;

  // return {
  // 	tex:
  // 	texSize:
  // 	shape:
  // 	cols:
  // }
}

function unpack(info, arr) {
  // return ndarray
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.pack = pack;
exports.unpack = unpack;
var readShader = exports.readShader = '#ifndef DECODE_FIXNUM\n#define DECODE_FIXNUM\n// http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/\nfloat decode_fixnum( vec4 rgba ) {\n\treturn (dot( rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/160581375.0) ) - 0.5) * 2048.0;\n}\n\n#endif\n////////////////////////////////\n\n\nuniform sampler2D @tex;\nuniform ivec2 @texSize;\nuniform ivec4 @shape;\n\nfloat @readch(ivec4 pos, int ch){\n\tint tile  = 4*(pos.x + \n\t\t\t\tpos.y * @shape.x + \n\t\t\t\tpos.z * @shape.x * @shape.y +\n\t\t\t\tpos.w * @shape.x * @shape.y * ceildiv(@shape.z, 4)) + ch;\n\n\treturn decode_fixnum(texture2D(@tex, (vec2(tile2vec(tile, @texSize.x)) + vec2(0.5, 0.5)) / vec2(@texSize)));\n}\n\nvec4 @read(ivec4 pos){\n    return vec4(@readch(pos, 0), @readch(pos, 1), @readch(pos, 2), @readch(pos, 3));\n}\n\n';
var writeShader = exports.writeShader = '#ifndef ENCODE_FIXNUM\n#define ENCODE_FIXNUM\n\n// http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/\n\nvec4 encode_fixnum(float v) {\n    vec4 enc = vec4(1.0, 255.0, 65025.0, 160581375.0) * (v / 2048.0 + 0.5);\n    enc = fract(enc);\n    enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);\n    return enc;\n}\n\n#endif\n////////////////////////////////\n\nuniform ivec2 @texSize;\nuniform ivec4 @shape;\n// uniform vec4 @decvec;\n\nvec4 process(ivec4 pos);\nvoid main(){\n\tint shapez = ceildiv(@shape.z, 4);\n\tint unscaled = vec2tile(ivec2(gl_FragCoord.xy), @texSize.x);\n\tint tile = unscaled / 4;\n\tint chunks = @shape.x * @shape.y * shapez * @shape.w;\n\tif(tile >= chunks){ checkerboard(); return; }\n\n\tvec4 value = activationFunc(process(ivec4(\n\t\timod(tile, @shape.x),\n\t\timod(tile / @shape.x, @shape.y),\n\t\timod(tile / @shape.x / @shape.y, shapez ),\n\t\ttile / @shape.x / @shape.y / shapez\n\t)));\n\n\tint ch = imod(unscaled, 4);\n    if(ch == 0){\n        gl_FragColor = encode_fixnum(value.x);\n    }else if(ch == 1){\n        gl_FragColor = encode_fixnum(value.y);\n    }else if(ch == 2){\n        gl_FragColor = encode_fixnum(value.z);\n    }else if(ch == 3){\n        gl_FragColor = encode_fixnum(value.w);\n    }\n}\n\n// void main(){\n// \tint shapez = ceildiv(@shape.z, 4);\n// \tint tile = vec2tile(ivec2(gl_FragCoord.x / 4, gl_FragCoord.y), @texSize.x / 4);\n// \tint chunks = @shape.x * @shape.y * shapez * @shape.w;\n// \tif(tile >= chunks){ checkerboard(); return; }\n\n// \tvec4 value = activationFunc(process(ivec4(\n// \t\timod(tile, @shape.x),\n// \t\timod(tile / @shape.x, @shape.y),\n// \t\timod(tile / @shape.x / @shape.y, shapez ),\n// \t\ttile / @shape.x / @shape.y / shapez\n// \t)));\n\n\n// }\n';

function init(shape) {
  var length = 4 * Math.ceil(shape[2] / 4) * shape[3] * shape[1] * shape[0];
  var cols = Math.ceil(Math.sqrt(length) / 4) * 4;
  var texSize = [cols, Math.ceil(length / cols)];
  return {
    texSize: texSize,
    shape: shape
  };
}

function pack(info, ndarray) {
  // return Uint8Array or Float32Array


  // uniform sampler2D @_tex;
  // uniform ivec2 @_texSize;
  // uniform ivec4 @_shape;
  // uniform int @_cols;

  // return {
  // 	tex:
  // 	texSize:
  // 	shape:
  // 	cols:
  // }
}

function unpack(info, arr) {
  // return ndarray
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.pack = pack;
exports.unpack = unpack;
var readShader = exports.readShader = '#ifndef DECODE_FLOAT\n#define DECODE_FLOAT\n\nfloat decode_float(vec4 val){\n    vec4 scl = floor(255.0 * val + 0.5);\n    float sgn = (scl.a < 128.0) ? 1.0 : -1.0;\n    float exn = mod(scl.a * 2.0, 256.0) + floor(scl.b / 128.0) - 127.0;\n    float man = 1.0 +\n        (scl.r / 8388608.0) + \n        (scl.g / 32768.0) +\n        mod(scl.b, 128.0) / 128.0;\n    return sgn * man * pow(2.0, exn);\n}\n\n#endif\n////////////////////////////////\n\nuniform sampler2D @tex;\nuniform ivec2 @texSize;\nuniform ivec4 @shape;\n\nfloat @readch(ivec4 pos, int ch){\n\t// int tile  = ch +\n\t// \t\t\tpos.x * 4 + \n\t// \t\t\tpos.y * @shape.x * 4 + \n\t// \t\t\tpos.z * @shape.x * 4 * @shape.y +\n\t// \t\t\tpos.w * @shape.x * 4 * @shape.y * ceildiv(@shape.z, 4);\n\tint tile  = 4*(pos.x + \n\t\t\t\tpos.y * @shape.x + \n\t\t\t\tpos.z * @shape.x * @shape.y +\n\t\t\t\tpos.w * @shape.x * @shape.y * ceildiv(@shape.z, 4)) + ch;\n\n\treturn decode_float(texture2D(@tex, (vec2(tile2vec(tile, @texSize.x)) + vec2(0.5, 0.5)) / vec2(@texSize)));\n}\n\nvec4 @read(ivec4 pos){\n    return vec4(@readch(pos, 0), @readch(pos, 1), @readch(pos, 2), @readch(pos, 3));\n}\n\n';
var writeShader = exports.writeShader = '#ifndef ENCODE_FLOAT\n#define ENCODE_FLOAT\n// https://github.com/mikolalysenko/glsl-read-float/blob/master/index.glsl\n\n#define FLOAT_MAX  1.70141184e38\n#define FLOAT_MIN  1.17549435e-38\n\nvec4 encode_float(float v) {\n    highp float av = abs(v);\n\n    //Handle special cases\n    if(av < FLOAT_MIN) {\n        return vec4(0.0, 0.0, 0.0, 0.0);\n    } else if(v > FLOAT_MAX) {\n        return vec4(127.0, 128.0, 0.0, 0.0) / 255.0;\n    } else if(v < -FLOAT_MAX) {\n        return vec4(255.0, 128.0, 0.0, 0.0) / 255.0;\n    }\n\n    highp vec4 c = vec4(0,0,0,0);\n\n    //Compute exponent and mantissa\n    highp float e = floor(log2(av));\n    highp float m = av * pow(2.0, -e) - 1.0;\n    \n    //Unpack mantissa\n    c[1] = floor(128.0 * m);\n    m -= c[1] / 128.0;\n    c[2] = floor(32768.0 * m);\n    m -= c[2] / 32768.0;\n    c[3] = floor(8388608.0 * m);\n    \n    //Unpack exponent\n    highp float ebias = e + 127.0;\n    c[0] = floor(ebias / 2.0);\n    ebias -= c[0] * 2.0;\n    c[1] += floor(ebias) * 128.0; \n\n    //Unpack sign bit\n    c[0] += 128.0 * step(0.0, -v);\n\n    //Scale back to range\n    return c.abgr / 255.0;\n}\n#endif\n////////////////////////////////\n\nuniform ivec2 @texSize;\nuniform ivec4 @shape;\n// uniform vec4 @decvec;\n\nvec4 process(ivec4 pos);\nvoid main(){\n\tint shapez = ceildiv(@shape.z, 4);\n\tint unscaled = vec2tile(ivec2(gl_FragCoord.xy), @texSize.x);\n\tint tile = unscaled / 4;\n\tint chunks = @shape.x * @shape.y * shapez * @shape.w;\n\tif(tile >= chunks){ checkerboard(); return; }\n\n\tvec4 value = activationFunc(process(ivec4(\n\t\timod(tile, @shape.x),\n\t\timod(tile / @shape.x, @shape.y),\n\t\timod(tile / @shape.x / @shape.y, shapez ),\n\t\ttile / @shape.x / @shape.y / shapez\n\t)));\n\n\tint ch = imod(unscaled, 4);\n    if(ch == 0){\n        gl_FragColor = encode_float(value.x);\n    }else if(ch == 1){\n        gl_FragColor = encode_float(value.y);\n    }else if(ch == 2){\n        gl_FragColor = encode_float(value.z);\n    }else if(ch == 3){\n        gl_FragColor = encode_float(value.w);\n    }\n}\n';

function init(shape) {
  var length = 4 * Math.ceil(shape[2] / 4) * shape[3] * shape[1] * shape[0];
  var cols = Math.ceil(Math.sqrt(length) / 4) * 4;
  var texSize = [cols, Math.ceil(length / cols)];
  return {
    texSize: texSize,
    shape: shape
  };
}

function pack(info, ndarray) {
  // return Uint8Array or Float32Array


  // uniform sampler2D @_tex;
  // uniform ivec2 @_texSize;
  // uniform ivec4 @_shape;
  // uniform int @_cols;

  // return {
  // 	tex:
  // 	texSize:
  // 	shape:
  // 	cols:
  // }
}

function unpack(info, arr) {
  // return ndarray
}

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.pack = pack;
exports.unpack = unpack;
var readShader = exports.readShader = 'uniform sampler2D @tex;\nuniform ivec2 @texSize;\nuniform ivec4 @shape;\n// uniform vec4 @decvec;\n\nvec4 @read(ivec4 pos){\n\tint tile  = pos.x + \n\t\t\t\tpos.y * @shape.x + \n\t\t\t\tpos.z * @shape.x * @shape.y +\n\t\t\t\tpos.w * @shape.x * @shape.y * ceildiv(@shape.z, 4);\n\n\t// int tile = int(dot(vec4(pos), vec4(1, @shape.x, @shape.x * @shape.y, @shape.x * @shape.y * ceildiv(@shape.z, 4))));\n\t// int tile = int(dot(vec4(pos), @decvec));\n\treturn texture2D(@tex, (vec2(tile2vec(tile, @texSize.x)) + vec2(0.5, 0.5)) / vec2(@texSize));\n}\n';
var writeShader = exports.writeShader = 'uniform ivec2 @texSize;\nuniform ivec4 @shape;\n// uniform vec4 @decvec;\n\nvec4 process(ivec4 pos);\nvoid main(){\n\tint shapez = ceildiv(@shape.z, 4);\n\tint tile = vec2tile(ivec2(gl_FragCoord.xy), @texSize.x);\n\tint chunks = @shape.x * @shape.y * shapez * @shape.w;\n\tif(tile >= chunks){ checkerboard(); return; }\n\n\tgl_FragColor = activationFunc(process(ivec4(\n\t\timod(tile, @shape.x),\n\t\timod(tile / @shape.x, @shape.y),\n\t\timod(tile / @shape.x / @shape.y, shapez ),\n\t\ttile / @shape.x / @shape.y / shapez\n\t)));\n}\n';

function init(shape) {
  var length = Math.ceil(shape[2] / 4) * shape[3] * shape[1] * shape[0];
  var cols = Math.ceil(Math.sqrt(length));
  var texSize = [cols, Math.ceil(length / cols)];
  return {
    texSize: texSize,
    shape: shape
  };
}

function pack(info, ndarray) {
  // return Uint8Array or Float32Array


  // uniform sampler2D @_tex;
  // uniform ivec2 @_texSize;
  // uniform ivec4 @_shape;
  // uniform int @_cols;

  // return {
  // 	tex:
  // 	texSize:
  // 	shape:
  // 	cols:
  // }
}

function unpack(info, arr) {
  // return ndarray
}

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.pack = pack;
exports.unpack = unpack;
var readShader = exports.readShader = 'uniform sampler2D @tex;\nuniform ivec2 @texSize;\nuniform ivec4 @shape;\nuniform int @cols;\n\nvec4 @read(ivec4 pos){\n    return texture2D(@tex, (\n        vec2(tile2vec(\n            vec2tile(pos.zw, ceildiv(@shape.z, 4))\n        , @cols) * @shape.xy) +\n        vec2(pos.xy) + vec2(0.5, 0.5)\n    ) / vec2(@texSize));\n}\n\nfloat @readf(ivec4 pos){ return _readf(@read, pos); }';
var writeShader = exports.writeShader = 'uniform ivec2 @texSize;\nuniform ivec4 @shape;\nuniform int @cols;\n\nvec4 process(ivec4 pos);\nvoid main(){\n    int tile = vec2tile(ivec2(gl_FragCoord.xy) / @shape.xy, @cols);\n    int chunks = ceildiv(@shape.z, 4);\n    if(tile >= chunks * @shape.w){ checkerboard(); return; }\n    gl_FragColor = activationFunc(process(ivec4(\n        mod(gl_FragCoord.xy, vec2(@shape.xy)), \n        tile2vec(tile, chunks))));\n}\n';

function init(shape) {
  var width = shape[0]; // var width = shape[0] * 4;    
  // we pick the number of columns so we can keep
  // the texture as square as possible, with the
  // minimal amount of wasted space.

  var tiles = Math.ceil(shape[2] / 4) * shape[3],
      cols = Math.max(1, Math.min(tiles, Math.round(Math.sqrt(shape[0] * shape[1] * tiles) / width)));

  var texSize = [width * cols, shape[1] * Math.ceil(tiles / cols)];

  return {
    texSize: texSize,
    cols: cols,
    shape: shape
  };
}

function pack(info, ndarray) {
  // return Uint8Array or Float32Array


  // uniform sampler2D @_tex;
  // uniform ivec2 @_texSize;
  // uniform ivec4 @_shape;
  // uniform int @_cols;

  // return {
  // 	tex:
  // 	texSize:
  // 	shape:
  // 	cols:
  // }
}

function unpack(info, arr) {
  // return ndarray
}

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('./tensor/index.js');

Object.defineProperty(exports, 'Tensor', {
  enumerable: true,
  get: function get() {
    return _index.Tensor;
  }
});
Object.defineProperty(exports, 'OutputTensor', {
  enumerable: true,
  get: function get() {
    return _index.OutputTensor;
  }
});
Object.defineProperty(exports, 'InPlaceTensor', {
  enumerable: true,
  get: function get() {
    return _index.InPlaceTensor;
  }
});

var _index2 = require('./runtime/index.js');

Object.defineProperty(exports, 'Run', {
  enumerable: true,
  get: function get() {
    return _index2.Run;
  }
});
Object.defineProperty(exports, 'Compile', {
  enumerable: true,
  get: function get() {
    return _index2.Compile;
  }
});

var _util = require('./util.js');

Object.defineProperty(exports, 'createGL', {
  enumerable: true,
  get: function get() {
    return _util.createGL;
  }
});

},{"./runtime/index.js":10,"./tensor/index.js":16,"./util.js":19}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    relu: "\n        vec4 activationFunc(vec4 data){\n            return max(data, vec4(0, 0, 0, 0));\n        }\n    ",
    tanh: "\n        vec4 activationFunc(vec4 data){\n            vec4 e = exp(2.0 * clamp(data, vec4(-20,-20,-20,-20), vec4(20,20,20,20)) );\n            return (e-vec4(1, 1, 1, 1))/(e+vec4(1, 1, 1, 1));\n        }\n    ",
    sigmoid: "\n        vec4 activationFunc(vec4 data){\n            return (vec4(1,1,1,1)/(vec4(1,1,1,1) + exp(-2.0 * \n                clamp(data,vec4(-20,-20,-20,-20), vec4(20,20,20,20)) )));\n        }\n    ",
    hard_sigmoid: "\n        vec4 activationFunc(vec4 data){\n            return clamp(data * vec4(0.2,0.2,0.2,0.2) + \n                vec4(.5,.5,.5,.5), vec4(0,0,0,0), vec4(1,1,1,1));\n        }\n    ",
    rgb: "\n        vec4 activationFunc(vec4 data){\n            return data / 255.0; \n        }\n    "
};

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.checkLinkError = checkLinkError;
exports.checkShaderError = checkShaderError;
exports.checkFramebufferError = checkFramebufferError;
// code for pretty printing shader errors from regl

function checkLinkError(gl, program, fragShader, vertShader, command) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var errLog = gl.getProgramInfoLog(program);
        var fragParse = parseSource(fragShader, command);
        var vertParse = parseSource(vertShader, command);

        var header = 'Error linking program with vertex shader, "' + vertParse[0].name + '", and fragment shader "' + fragParse[0].name + '"';

        if (typeof document !== 'undefined') {
            console.log('%c' + header + '\n%c' + errLog, 'color:red;text-decoration:underline;font-weight:bold', 'color:red');
        } else {
            console.log(header + '\n' + errLog);
        }
        throw new Error(header);
    }
}

function checkShaderError(gl, shader, source, type, command) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var errLog = gl.getShaderInfoLog(shader);
        var typeName = type === gl.FRAGMENT_SHADER ? 'fragment' : 'vertex';
        // checkCommandType(source, 'string', typeName + ' shader source must be a string', command)

        var files = parseSource(source, command);
        var errors = parseErrorLog(errLog);
        annotateFiles(files, errors);

        Object.keys(files).forEach(function (fileNumber) {
            var file = files[fileNumber];
            if (!file.hasErrors) {
                return;
            }

            var strings = [''];
            var styles = [''];

            function push(str, style) {
                strings.push(str);
                styles.push(style || '');
            }

            push('file number ' + fileNumber + ': ' + file.name + '\n', 'color:red;text-decoration:underline;font-weight:bold');

            file.lines.forEach(function (line) {
                if (line.errors.length > 0) {
                    push(leftPad(line.number, 4) + '|  ', 'background-color:yellow; font-weight:bold');
                    push(line.line + '\n', 'color:red; background-color:yellow; font-weight:bold');

                    // try to guess token
                    var offset = 0;
                    line.errors.forEach(function (error) {
                        var message = error.message;
                        var token = /^\s*\'(.*)\'\s*\:\s*(.*)$/.exec(message);
                        if (token) {
                            var tokenPat = token[1];
                            message = token[2];
                            switch (tokenPat) {
                                case 'assign':
                                    tokenPat = '=';
                                    break;
                            }
                            offset = Math.max(line.line.indexOf(tokenPat, offset), 0);
                        } else {
                            offset = 0;
                        }

                        push(leftPad('| ', 6));
                        push(leftPad('^^^', offset + 3) + '\n', 'font-weight:bold');
                        push(leftPad('| ', 6));
                        push(message + '\n', 'font-weight:bold');
                    });
                    push(leftPad('| ', 6) + '\n');
                } else {
                    push(leftPad(line.number, 4) + '|  ');
                    push(line.line + '\n', 'color:red');
                }
            });
            if (typeof document !== 'undefined') {
                styles[0] = strings.join('%c');
                console.log.apply(console, styles);
            } else {
                console.log(strings.join(''));
            }
        });

        throw new Error('Error compiling ' + typeName + ' shader, ' + files[0].name);
    }
}

function checkFramebufferError(gl) {

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE) {
        var statusCode = {};
        statusCode[gl.FRAMEBUFFER_COMPLETE] = 'complete';
        statusCode[gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT] = 'incomplete attachment';
        statusCode[gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS] = 'incomplete dimensions';
        statusCode[gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT] = 'incomplete, missing attachment';
        statusCode[gl.FRAMEBUFFER_UNSUPPORTED] = 'unsupported';
        throw new Error('framebuffer configuration not supported, status = ' + statusCode[status]);
    }
}

function leftPad(str, n) {
    str = str + '';
    while (str.length < n) {
        str = ' ' + str;
    }
    return str;
}

function ShaderFile() {
    this.name = 'unknown';
    this.lines = [];
    this.index = {};
    this.hasErrors = false;
}

function ShaderLine(number, line) {
    this.number = number;
    this.line = line;
    this.errors = [];
}

function ShaderError(fileNumber, lineNumber, message) {
    this.file = fileNumber;
    this.line = lineNumber;
    this.message = message;
}

function parseSource(source, command) {
    var lines = source.split('\n');
    var lineNumber = 1;
    var fileNumber = 0;
    var files = {
        unknown: new ShaderFile(),
        0: new ShaderFile()
    };
    files.unknown.name = files[0].name = 'unknown';
    files.unknown.lines.push(new ShaderLine(0, ''));
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];
        var parts = /^\s*\#\s*(\w+)\s+(.+)\s*$/.exec(line);
        if (parts) {
            switch (parts[1]) {
                case 'line':
                    var lineNumberInfo = /(\d+)(\s+\d+)?/.exec(parts[2]);
                    if (lineNumberInfo) {
                        lineNumber = lineNumberInfo[1] | 0;
                        if (lineNumberInfo[2]) {
                            fileNumber = lineNumberInfo[2] | 0;
                            if (!(fileNumber in files)) {
                                files[fileNumber] = new ShaderFile();
                            }
                        }
                    }
                    break;
                case 'define':
                    var nameInfo = /SHADER_NAME(_B64)?\s+(.*)$/.exec(parts[2]);
                    if (nameInfo) {
                        files[fileNumber].name = nameInfo[1] ? decodeB64(nameInfo[2]) : nameInfo[2];
                    }
                    break;
            }
        }
        files[fileNumber].lines.push(new ShaderLine(lineNumber++, line));
    }
    Object.keys(files).forEach(function (fileNumber) {
        var file = files[fileNumber];
        file.lines.forEach(function (line) {
            file.index[line.number] = line;
        });
    });
    return files;
}

function parseErrorLog(errLog) {
    var result = [];
    errLog.split('\n').forEach(function (errMsg) {
        if (errMsg.length < 5) {
            return;
        }
        var parts = /^ERROR\:\s+(\d+)\:(\d+)\:\s*(.*)$/.exec(errMsg);
        if (parts) {
            result.push(new ShaderError(parts[1] | 0, parts[2] | 0, parts[3].trim()));
        } else if (errMsg.length > 0) {
            result.push(new ShaderError('unknown', 0, errMsg));
        }
    });
    return result;
}

function annotateFiles(files, errors) {
    errors.forEach(function (error) {
        var file = files[error.file];
        if (file) {
            var line = file.index[error.line];
            if (line) {
                line.errors.push(error);
                file.hasErrors = true;
                return;
            }
        }
        files.unknown.hasErrors = true;
        files.unknown.lines[0].errors.push(error);
    });
}

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = assembleFragmentShader;

var _base = require('../tensor/base.js');

var _base2 = _interopRequireDefault(_base);

var _activations = require('./activations.js');

var _activations2 = _interopRequireDefault(_activations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { Tensor, OutputTensor, InPlaceTensor } from '../tensor/index.js'
var TENSOR_FRAGMENT_HEADER = '#ifdef GL_FRAGMENT_PRECISION_HIGH\n\tprecision highp float;\n#else\n\tprecision mediump float;\n#endif\n\nint   imod(int f, int p){ return f - p * (f / p); }\nint   vec2tile(ivec2 v, int rows){ return rows * v.y + v.x; }\nivec2 tile2vec(int f, int rows){ return ivec2(imod(f, rows), f / rows); }\nint   ceildiv(int a, int b){ return (a - 1) / b + 1; }\nvoid  checkerboard(){ gl_FragColor = vec4(mod(gl_FragCoord.x - gl_FragCoord.y, 2.0), 0.2, 0.1, 1); }\n\nfloat chsel(vec4 val, int ch){\n\tif(ch == 0) return val.r;\n\tif(ch == 1) return val.g;\n\tif(ch == 2) return val.b;\n\tif(ch == 3) return val.a;\n}\n\n#define _readf(read, pos) chsel(read(ivec4(pos.xy, pos.z / 4, pos.w)), imod(pos.z, 4))\n';

function assembleFragmentShader(shaderGen, output, uniforms) {
    var tensorShader = shaderGen(uniforms, output);

    var fragmentShader = TENSOR_FRAGMENT_HEADER;

    for (var uniform in uniforms) {
        if (uniforms[uniform] instanceof _base2.default) {
            var tensor = uniforms[uniform];

            fragmentShader += tensor._format.readShader.replace(/@/g, uniform + '_');
        }
    }

    var activation = '\n#define activationFunc\n';
    if (typeof uniforms._activation == 'string' && uniforms._activation != 'linear') {
        if (!(uniforms._activation.toLowerCase() in _activations2.default)) throw new Error('Unknown activation type ' + uniforms._activation.toLowerCase());
        activation = _activations2.default[uniforms._activation.toLowerCase()];
    }
    fragmentShader += activation;
    fragmentShader += output._format.writeShader.replace(/@/g, 'out_');

    fragmentShader += tensorShader;

    return fragmentShader;
}

},{"../tensor/base.js":14,"./activations.js":7}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Compile = Compile;
exports.Run = Run;

var _program = require('./program.js');

var _program2 = _interopRequireDefault(_program);

var _frag = require('./frag.js');

var _frag2 = _interopRequireDefault(_frag);

var _index = require('../tensor/index.js');

var _check = require('./check.js');

var _tnsl = require('./tnsl.js');

var _tnsl2 = _interopRequireDefault(_tnsl);

var _timer = require('./timer.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Compile(shaderGen, output) {
    var uniforms = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var startTime = (0, _timer.now)();
    if (!(output instanceof _index.OutputTensor)) throw new Error("First argument must be an instance of OutputTensor");

    if (typeof shaderGen === 'string') shaderGen = (0, _tnsl2.default)(shaderGen);

    var gl = output.gl;
    var program = (0, _program2.default)(gl, (0, _frag2.default)(shaderGen, output, uniforms));
    var compileTime = (0, _timer.now)() - startTime;
    // console.log('Compile Time', compileTime)
    return program;
}

function Run(shaderGen, output) {
    var uniforms = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var tp = Compile(shaderGen, output, uniforms);

    var gl = output.gl;

    (0, _timer.beginTimer)(gl, {
        shader: shaderGen,
        output: output
    });

    gl.useProgram(tp.program);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    var setUniform = tp.setUniform,
        texIndex = 0,
        mustSwap = false;

    for (var name in uniforms) {
        if (name.startsWith('_')) continue;

        if (name + '_tex' in tp.uniformTypes) {
            var tensor = uniforms[name];
            if (tensor.gl !== output.gl) throw new Error('Uniforms must belong to same GL context as output');
            if (tensor === output) mustSwap = true;

            for (var uniform in tensor._info) {
                setUniform(name + '_' + uniform, tensor._info[uniform]);
            }

            gl.activeTexture(gl['TEXTURE' + texIndex]);
            gl.bindTexture(gl.TEXTURE_2D, tensor.tex);
            setUniform(name + '_tex', texIndex);

            texIndex++;
        } else if (name in tp.uniformTypes) {
            setUniform(name, uniforms[name]);
        } else {
            throw new Error("Unknown uniform " + name);
        }
    }

    // Ordinarily we can't write to the same texture that we're using as
    // an input, as this could lead to all sorts of terrible race conditions,
    // undefined behavior, and invalid state. InPlaceTensors actually consist
    // of a pair of textures which are swapped for these in-place operations. 
    if (mustSwap) output.swap();

    for (var _uniform in output._info) {
        setUniform('out_' + _uniform, output._info[_uniform]);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, output.fbo);
    gl.viewport(0, 0, output._info.texSize[0], output._info.texSize[1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // draw to framebuffer

    (0, _check.checkFramebufferError)(gl);

    // var runTime = now() - startTime;
    // timer.end()
    (0, _timer.endTimer)(gl, function (info) {
        console.log('GPU time: ', info);
    });
    // console.log('CPU Run Time', runTime)

    return output;
}

},{"../tensor/index.js":16,"./check.js":8,"./frag.js":9,"./program.js":11,"./timer.js":12,"./tnsl.js":13}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = getTensorProgram;
exports.bindAttributeBuffer = bindAttributeBuffer;
exports.createShaderProgram = createShaderProgram;

var _check = require('./check.js');

var TENSOR_VERTEX_SHADER = '\n    // TENSOR_VERTEX_SHADER\n\n    attribute vec2 a_position;\n    void main() {\n        gl_Position = vec4(a_position, 0, 1);\n    }\n';

var UNIFORM_SETTERS = { vec4: '4fv', vec3: '3fv', vec2: '2fv', float: '1f',
    ivec4: '4iv', ivec3: '3iv', ivec2: '2iv', int: '1i',
    sampler2D: '1i' };

function getTensorProgram(gl, fragmentShader) {
    if (!gl._tensorPrograms) gl._tensorPrograms = {};
    if (fragmentShader in gl._tensorPrograms) {
        return gl._tensorPrograms[fragmentShader];
    }
    var program = createTensorProgram(gl, fragmentShader);
    gl._tensorPrograms[fragmentShader] = program;
    return program;
}

function createTensorProgram(gl, fragmentShader) {
    var program = createShaderProgram(gl, TENSOR_VERTEX_SHADER, fragmentShader);

    gl.useProgram(program);
    bindAttributeBuffer(gl, program);

    var uniformTypes = extractUniformDeclarations(fragmentShader),
        uniformLocs = {};

    function addUniform(name, type) {
        uniformLocs[name] = { loc: gl.getUniformLocation(program, name), type: type };
    }

    for (var name in uniformTypes) {
        var type = uniformTypes[name];
        if (type in UNIFORM_SETTERS) {
            addUniform(name, type);
        } else throw new Error("Unknown uniform type " + type);
    }

    function setUniform(name, value) {
        if (!(name in uniformLocs)) {
            throw new Error("Could not find uniform " + name);
        }
        gl['uniform' + UNIFORM_SETTERS[uniformLocs[name].type]](uniformLocs[name].loc, value);
    }

    return {
        program: program,
        uniformLocs: uniformLocs,
        uniformTypes: uniformTypes,
        setUniform: setUniform
    };
}

function bindAttributeBuffer(gl, program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    var positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

function extractUniformDeclarations(str) {
    var uniforms = {};
    str = str.replace(/((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g, '');
    str = str.replace(/\/\/.*\n/g, '');
    var m,
        re = /uniform\s*([\w_]+)\s*([\w_]+)/g;
    while (m = re.exec(str)) {
        uniforms[m[2]] = m[1];
    }return uniforms;
}

function createShaderProgram(gl, vertexSource, fragmentSource) {
    var vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    var fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // interestingly enough it seems like Safari never emits
    // a shader program link error. 
    (0, _check.checkLinkError)(gl, program, fragmentSource, vertexSource);

    return program;
}

function compileShader(gl, shaderSource, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    (0, _check.checkShaderError)(gl, shader, shaderSource, shaderType);
    return shader;
}

},{"./check.js":8}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.now = now;
exports.beginTimer = beginTimer;
exports.endTimer = endTimer;
function now() {
	if (typeof performance === 'undefined') {
		return Date.now();
	} else {
		return performance.now();
	}
}

function getTimer(gl) {
	if (gl.NO_PROFILE) return;
	if (typeof gl.TIMER_POOL === 'undefined') {
		gl.TIMER_POOL = createTimer(gl);
	}
	return gl.TIMER_POOL;
}

function beginTimer(gl) {
	var info = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var timer = getTimer(gl);
	if (timer) {
		timer.begin(info);
	}
}

function endTimer(gl, callback) {
	var timer = getTimer(gl);
	if (timer) {
		timer.end(callback);
	}
}

function createTimer(gl) {
	var extTimer = gl.getExtension('ext_disjoint_timer_query');

	if (!extTimer) return null;

	var queryPool = [];
	function allocQuery() {
		return queryPool.pop() || extTimer.createQueryEXT();
	}
	function freeQuery(query) {
		queryPool.push(query);
	}

	var pendingQueries = [];
	function beginQuery(info) {
		var query = allocQuery();
		extTimer.beginQueryEXT(extTimer.TIME_ELAPSED_EXT, query);
		pendingQueries.push([query, info]);
	}

	function endQuery() {
		extTimer.endQueryEXT(extTimer.TIME_ELAPSED_EXT);
	}

	function callback(info, time) {
		var fn = info.callback;
		info.gpuTime = time;
		delete info.callback;
		if (fn) fn(info);
	}

	function monitorPending() {
		for (var i = 0; i < pendingQueries.length; ++i) {
			var query = pendingQueries[i][0];
			if (extTimer.getQueryObjectEXT(query, extTimer.QUERY_RESULT_AVAILABLE_EXT)) {
				var queryTime = extTimer.getQueryObjectEXT(query, extTimer.QUERY_RESULT_EXT);
				callback(pendingQueries[i][1], queryTime / 1e6);
				freeQuery(query);
				pendingQueries.splice(i, 1);
				i--;
			}
		}
	}

	var isPolling = false;
	function loop() {
		// console.log('loop', pendingQueries.length)
		if (pendingQueries.length > 0) {
			monitorPending();
			requestAnimationFrame(loop);
		} else {
			isPolling = false;
		}
	}

	var currentInfo = null;
	return {
		begin: function begin() {
			var info = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			if (currentInfo) throw new Error('beginTimer was called before previous endTimer');
			currentInfo = info;
			info.cpuStartTime = now();
			beginQuery(currentInfo);
		},
		end: function end(fn) {
			currentInfo.cpuEndTime = now();
			currentInfo.callback = fn;
			currentInfo = null;
			endQuery();

			if (isPolling === false) {
				isPolling = true;
				requestAnimationFrame(loop);
			}
		}
	};
}

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = TNSL;
// TNSL (pronounced tinsel)
// is a domain specific language based on GLSL
// for helping with the writing code that
// computes with tensors. 

// A limitation of GLSL is that the condition
// of any loop has to be statically known 
// (e.g. counters up to a fixed constant
// value) which is problematic if we want
// to write general code that depends on
// the size of the input tensors

// TNSL adds the following syntax:
//      #(image.shape)
// which will be replaced with an ivec4
// containing the shape of the input tensor "image"
// automatically

function TNSL(str) {
    if (typeof str != 'string') throw new Error('TNSL shader preprocessor only accepts strings');

    return function (uniforms, output) {
        return str.replace(/uniform\s*Tensor\s*([\w_]+)\s*;/g, '/* (Tensor $1) */').replace(/\#\(([\w\.\s]+)\)/g, function (all, body) {
            var obj = uniforms;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = body.split('.')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var part = _step.value;

                    obj = obj[part.trim()];
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            if (typeof obj == 'number') {
                return obj.toString();
            } else if (Array.isArray(obj) && obj.length <= 4 && obj.length > 1) {
                return (obj.every(Number.isInteger) ? 'i' : '') + 'vec' + obj.length + '(' + obj.join(',') + ')';
            }
            throw new Error('Can not inline expression ' + body);
        }).replace(/\#\s*(\w+)\s*\[(.*?)\]/g, function (all, tensor, body) {
            return tensor + '_read(ivec4(' + body + '))';
        });
    };
}

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _show2 = require('./show.js');

var _show3 = _interopRequireDefault(_show2);

var _helpers = require('./helpers.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseTensor = function () {
	function BaseTensor(gl, type, format, shape, data) {
		_classCallCheck(this, BaseTensor);

		// validate glcontext
		if (!gl.createTexture) throw new Error('Invalid WebGLRenderingContext');
		this.gl = gl;

		// validate shape
		if (shape.some(function (k) {
			return !isFinite(k) || k < 1 || !Number.isInteger(k);
		}) || shape.length > 4) throw new Error('Invalid shape: ' + shape);
		shape = shape.concat([1, 1, 1, 1]).slice(0, 4);
		this.shape = shape;

		// validate type
		if (!(type === 'uint8' || type === 'float32')) throw new Error('Type must be uint8 or float32');
		this._type = type;

		// validate format
		if (!(format.init && format.pack && format.unpack)) throw new Error('Format must be object implementing init, pack, unpack');
		this._format = format;

		// calculate texture size
		this._info = this._format.init(shape);
		if (!this._info.texSize) throw new Error('Format did not yield texSize');

		// initialize texture
		this.tex = (0, _helpers.makeTexture)(gl);
		this.update(data);
	}

	_createClass(BaseTensor, [{
		key: '_update',
		value: function _update(data) {
			if (!(this._type === 'uint8' || this._type === 'float32')) throw new Error('Type must be uint8 or float32');

			var gl = this.gl;
			gl.bindTexture(gl.TEXTURE_2D, this.tex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._info.texSize[0], this._info.texSize[1], 0, gl.RGBA, this._type == 'uint8' ? gl.UNSIGNED_BYTE : gl.FLOAT, data);
		}
	}, {
		key: 'update',
		value: function update(data) {
			if (!data) return this._update(null);
			this._update(this._format.pack(this._info, data));
		}
	}, {
		key: '_show',
		value: function _show() {
			var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			(0, _show3.default)(this.gl, this.tex, opt);
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			this.gl.deleteTexture(this.tex);
		}
	}]);

	return BaseTensor;
}();

exports.default = BaseTensor;

},{"./helpers.js":15,"./show.js":17}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeFrameBuffer = makeFrameBuffer;
exports.makeTexture = makeTexture;
function makeFrameBuffer(gl, texture) {
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return framebuffer;
}

function makeTexture(gl) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
}

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.InPlaceTensor = exports.OutputTensor = exports.Tensor = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

var _testing = require('./testing.js');

var _helpers = require('./helpers.js');

var _index = require('../format/tile/index.js');

var NormalFormat = _interopRequireWildcard(_index);

var _index2 = require('../format/alt-tile-fixnum/index.js');

var AltFormat = _interopRequireWildcard(_index2);

var _index3 = require('../format/stride/index.js');

var StrideFormat = _interopRequireWildcard(_index3);

var _index4 = require('../format/stride-nofloat/index.js');

var NofloatFormat = _interopRequireWildcard(_index4);

var _index5 = require('../format/stride-fixnum/index.js');

var FixnumFormat = _interopRequireWildcard(_index5);

var _index6 = require('../runtime/index.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// import * as NofloatFormat from '../format/tile-nofloat/index.js'
// import * as AltFormat from '../format/alt-tile-nofloat/index.js'

// import * as FixnumFormat from '../format/tile-fixnum/index.js'


var Tensor = exports.Tensor = function (_BaseTensor) {
    _inherits(Tensor, _BaseTensor);

    // constructor(gl, shape = [], data = null, options = {})
    function Tensor(gl) {
        var shape = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, Tensor);

        for (var _len = arguments.length, stuff = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
            stuff[_key - 3] = arguments[_key];
        }

        var options = Object.assign.apply(Object, [{}].concat(stuff));

        // constructor(gl, type, format, shape)
        // less restrictive constructors
        if (!gl.NO_FLOAT_TEXTURES) {
            if (!gl.getExtension('OES_texture_float')) {
                console.info("This browser does not seem to support OES_texture_float. " + "Using float codec workaround from now on.");
                gl.NO_FLOAT_TEXTURES = true;
            }
        }

        if (!gl.NO_FLOAT_TEXTURES) {
            if (!gl.RENDER_FLOAT_TESTED && !gl.NO_RENDER_FLOAT) {
                if (!(0, _testing.testRenderFloat)(gl)) {
                    console.info("This browser supports OES_texture_float, " + "but can not render to floating textures. " + "Using float codec workaround for output tensors from now on.");
                    gl.NO_RENDER_FLOAT = true;
                }
                gl.RENDER_FLOAT_TESTED = true;
            }
        }

        if (shape.shape) {
            // ndarrays can be passed instead of raw data
            options = data;
            data = shape;
            shape = shape.shape;
        }
        if (shape.width && shape.height && shape.data) {
            // imagedata objects can be passed
            options = data;
            data = shape.data;
            shape = [shape.width, shape.height];
        }

        options = options || {};

        var type;
        if (data === null || data === 'nofloat' || data === 'stride' || data instanceof Float32Array || data === 'float32' || data instanceof Float64Array || Array.isArray(data)) {
            // null defaults to a float32 texture type
            type = 'float32';
        } else if (data instanceof Uint8Array || data === 'uint8' || data instanceof Uint8ClampedArray) {
            type = 'uint8';
        } else if (data.shape) {
            if (data.data instanceof Uint8Array) {
                type = 'uint8';
            } else {
                type = 'float32';
            }
        } else {
            throw new Error("Invalid format for data: must be Uint8Array or Float32Array or ndarray");
        }

        var nofloat = type === 'float32' && (true || gl.NO_FLOAT_TEXTURES || data === 'nofloat' || options.nofloat || gl.NO_RENDER_FLOAT && options.output);

        var stride = options.stride || data === 'stride';

        if (typeof data == 'string') data = null;

        if (nofloat) {
            var _this = _possibleConstructorReturn(this, (Tensor.__proto__ || Object.getPrototypeOf(Tensor)).call(this, gl, 'uint8', AltFormat, shape));
        } else if (stride) {
            var _this = _possibleConstructorReturn(this, (Tensor.__proto__ || Object.getPrototypeOf(Tensor)).call(this, gl, type, StrideFormat, shape));
        } else {
            var _this = _possibleConstructorReturn(this, (Tensor.__proto__ || Object.getPrototypeOf(Tensor)).call(this, gl, type, NormalFormat, shape));
        }

        _this.type = type;
        return _possibleConstructorReturn(_this);
    }

    _createClass(Tensor, [{
        key: 'show',
        value: function show() {
            var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this._show(opt);
        }
    }, {
        key: 'copy',
        value: function copy() {
            var dtype = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'float32';
            var constructor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : OutputTensor;

            var TENSOR_IDENTITY = '\n            uniform Tensor image;\n            vec4 process(ivec4 pos) { return #image[pos]; }\n        ';
            var out = new constructor(this.gl, this.shape, dtype);
            (0, _index6.Run)(TENSOR_IDENTITY, out, { image: this });
            return out;
        }
    }, {
        key: 'show',
        value: function show() {
            var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            if (this._format !== NormalFormat) {
                var out = this.copy('uint8');
                out._show(opt);
                out.destroy();
            } else this._show(opt);
        }
    }]);

    return Tensor;
}(_base2.default);

var OutputTensor = exports.OutputTensor = function (_Tensor) {
    _inherits(OutputTensor, _Tensor);

    function OutputTensor(gl) {
        var _ref;

        var shape = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, OutputTensor);

        for (var _len2 = arguments.length, stuff = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
            stuff[_key2 - 3] = arguments[_key2];
        }

        var _this2 = _possibleConstructorReturn(this, (_ref = OutputTensor.__proto__ || Object.getPrototypeOf(OutputTensor)).call.apply(_ref, [this, gl, shape, data].concat(stuff, [{ output: true }])));

        _this2.fbo = (0, _helpers.makeFrameBuffer)(_this2.gl, _this2.tex);
        return _this2;
    }

    _createClass(OutputTensor, [{
        key: 'destroy',
        value: function destroy() {
            _get(OutputTensor.prototype.__proto__ || Object.getPrototypeOf(OutputTensor.prototype), 'destroy', this).call(this);
            this.gl.deleteFramebuffer(this.fbo);
        }
    }, {
        key: '_read',
        value: function _read() {
            // this.gl.readPixels(...)
        }
    }, {
        key: 'read',
        value: function read() {
            return this._format.unpack(this._info, this._read());
        }
    }]);

    return OutputTensor;
}(Tensor);

var InPlaceTensor = exports.InPlaceTensor = function (_OutputTensor) {
    _inherits(InPlaceTensor, _OutputTensor);

    function InPlaceTensor() {
        var _ref2;

        _classCallCheck(this, InPlaceTensor);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _possibleConstructorReturn(this, (_ref2 = InPlaceTensor.__proto__ || Object.getPrototypeOf(InPlaceTensor)).call.apply(_ref2, [this].concat(args)));
    }

    return InPlaceTensor;
}(OutputTensor);

},{"../format/alt-tile-fixnum/index.js":1,"../format/stride-fixnum/index.js":2,"../format/stride-nofloat/index.js":3,"../format/stride/index.js":4,"../format/tile/index.js":5,"../runtime/index.js":10,"./base.js":14,"./helpers.js":15,"./testing.js":18}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = showTexture;

var _program = require('../runtime/program.js');

var SHOW_TEXTURE_VERTEX = '\n    attribute vec2 a_position;\n    varying mediump vec2 pos;\n    void main() {\n        pos = (a_position + vec2(1, 1)) / 2.0;\n        gl_Position = vec4(a_position, 0, 1);\n    }\n';

var SHOW_TEXTURE_FRAGMENT = '\n    precision mediump float;\n\n    uniform sampler2D tex;\n    uniform float scale;\n    uniform float offset;\n    uniform bool transpose;\n    uniform bool flipX;\n    uniform bool flipY;\n    uniform int channels;\n\n    varying vec2 pos;\n\n    vec4 colormap(float x) {\n        float r = clamp(8.0 / 3.0 * x, 0.0, 1.0);\n        float g = clamp(8.0 / 3.0 * x - 1.0, 0.0, 1.0);\n        float b = clamp(4.0 * x - 3.0, 0.0, 1.0);\n        return vec4(r, g, b, 1.0);\n    }\n\n    void main() {\n        vec2 p = pos;\n        if(flipX) p.x = 1.0 - p.x;\n        if(flipY) p.y = 1.0 - p.y;\n        if(transpose) p = p.yx;\n        if(channels == 4){\n            gl_FragColor = vec4(vec4(offset, offset, offset, offset) \n                + scale * texture2D(tex, p));\n        }else if(channels == 3){\n            gl_FragColor = vec4(vec3(offset, offset, offset) \n                + scale * texture2D(tex, p).rgb, 1);\n        }else if(channels == 2){\n            gl_FragColor = vec4(vec2(offset, offset) \n                + scale * texture2D(tex, p).rg, 0, 1);\n        }else if(channels == 1){\n            gl_FragColor = colormap(offset + scale * texture2D(tex, p).r);\n        }\n    }\n';

function showTexture(gl, tex) {
    var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!gl._showProgram) {
        gl._showProgram = (0, _program.createShaderProgram)(gl, SHOW_TEXTURE_VERTEX, SHOW_TEXTURE_FRAGMENT);
        gl.useProgram(gl._showProgram);
        (0, _program.bindAttributeBuffer)(gl, gl._showProgram);
        gl.uniform1i(gl.getUniformLocation(gl._showProgram, 'tex'), 0);
    }

    gl.useProgram(gl._showProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1f(gl.getUniformLocation(gl._showProgram, 'scale'), opt.scale || 1);
    gl.uniform1f(gl.getUniformLocation(gl._showProgram, 'offset'), opt.offset || 0);
    gl.uniform1i(gl.getUniformLocation(gl._showProgram, 'transpose'), opt.transpose ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(gl._showProgram, 'flipX'), opt.flipX ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(gl._showProgram, 'flipY'), opt.flipY ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(gl._showProgram, 'channels'), opt.channels || 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

},{"../runtime/program.js":11}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.testRenderFloat = testRenderFloat;

var _program = require('../runtime/program.js');

var _helpers = require('./helpers.js');

var CHECK_FLOAT_VERTEX = '\n    attribute vec2 a_position;\n    void main() {\n        gl_Position = vec4(a_position, 0, 1);\n    }\n';
var CHECK_FLOAT_FRAGMENT = '\n    void main() {\n        gl_FragColor = vec4(3.14159, -2.71828, 1.61828, 42);\n    }\n';

// some browsers (e.g. mobile safari) are capable of initializing floating 
// point textures but unable to write to them. The only way of finding this
// out is by trying to render to a floating point texture and noticing
// the invalid framebuffer status.

function testRenderFloat(gl) {
    var tex = (0, _helpers.makeTexture)(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 10, 10, 0, gl.RGBA, gl.FLOAT, null);
    var fbo = (0, _helpers.makeFrameBuffer)(gl, tex);

    var program = (0, _program.createShaderProgram)(gl, CHECK_FLOAT_VERTEX, CHECK_FLOAT_FRAGMENT);
    gl.useProgram(program);
    (0, _program.bindAttributeBuffer)(gl, program);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, 10, 10);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.deleteTexture(tex);
    gl.deleteFramebuffer(fbo);
    gl.deleteProgram(program);

    return status == gl.FRAMEBUFFER_COMPLETE;
}

},{"../runtime/program.js":11,"./helpers.js":15}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createGL = createGL;
function createGL(canvas) {
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        document.body.appendChild(canvas);
    }
    var gl = canvas.getContext("webgl", { antialias: false }) || canvas.getContext("experimental-webgl", { antialias: false });
    if (!gl) alert('Could not initialize WebGL, try another browser');
    return gl;
}

},{}]},{},[6])(6)
});