(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var _templateObject = _taggedTemplateLiteral(['\n    uniform Tensor image;\n\n    vec4 process(ivec4 pos) {\n        if(pos.z == 3){\n            float k = dot(readTensor(image, ivec4(pos.xy, 0, 0)), vec4(0.21216, 0.7152, 0.0722, 0));    \n            return vec4(k, k, k, 1);\n        }\n        return readTensor(image, ivec4(pos.xy, 0, 0)) \n            * vec4(pos.z==0?2:1, pos.z==1?2:1, pos.z==2?2:1, 1);\n    }\n'], ['\n    uniform Tensor image;\n\n    vec4 process(ivec4 pos) {\n        if(pos.z == 3){\n            float k = dot(readTensor(image, ivec4(pos.xy, 0, 0)), vec4(0.21216, 0.7152, 0.0722, 0));    \n            return vec4(k, k, k, 1);\n        }\n        return readTensor(image, ivec4(pos.xy, 0, 0)) \n            * vec4(pos.z==0?2:1, pos.z==1?2:1, pos.z==2?2:1, 1);\n    }\n']),
    _templateObject2 = _taggedTemplateLiteral(['\n    uniform Tensor image;\n\n    vec4 process(ivec4 pos) {\n        return vec4(vec2(pos.xy) / 256.0, 0, 1);\n        // return texture2D(image.tex, vec2(pos.xy) / vec2(_outputShape.xy));\n    }\n'], ['\n    uniform Tensor image;\n\n    vec4 process(ivec4 pos) {\n        return vec4(vec2(pos.xy) / 256.0, 0, 1);\n        // return texture2D(image.tex, vec2(pos.xy) / vec2(_outputShape.xy));\n    }\n']),
    _templateObject3 = _taggedTemplateLiteral(['\n    uniform Tensor image;\n\n    vec4 process(ivec4 pos) {\n        if(pos.w == 0){\n            return readTensor(image, ivec4(pos.xyz, 0));\n        }else{\n            return readTensor(image, ivec4(pos.yxz, 0));\n        }\n    }\n'], ['\n    uniform Tensor image;\n\n    vec4 process(ivec4 pos) {\n        if(pos.w == 0){\n            return readTensor(image, ivec4(pos.xyz, 0));\n        }else{\n            return readTensor(image, ivec4(pos.yxz, 0));\n        }\n    }\n']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var gl = TF.createGL(),
    OutputTensor = TF.OutputTensor,
    Tensor = TF.Tensor,
    InPlaceTensor = TF.InPlaceTensor,
    TP = function TP(s) {
    return function (out, opt) {
        return TF.Run(s.join(''), out, opt);
    };
};

global.gl = gl;

var ColorizeQuad = TP(_templateObject);

var RawMirror = TP(_templateObject2);

var ColorMirror = TP(_templateObject3);

gl.canvas.width = 512;
gl.canvas.height = 512;

function loadImage(url, cb) {
    var image = new Image(),
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    image.src = url;
    image.onload = function () {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);
        cb(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
}

loadImage('./doge.jpg', function (im) {
    // we can convert the image data into an ndarray
    var ndoge = ndarray(new Float32Array(im.data), [im.width, im.height, 4]);
    ndops.divseq(ndoge, 255);
    global.doge = new Tensor(gl, ndoge.transpose(1, 0, 2));

    // global.mirror = new OutputTensor(gl, [im.width, im.height, 4]);
    // RawMirror(mirror, { image: doge })

    // we can load directly from imagedata
    // global.doge = new Tensor(gl, im)

    global.multidoge = new OutputTensor(gl, [im.width, im.height, 4 * 4]);
    ColorizeQuad(multidoge, { image: doge });

    global.hyperdoge = new OutputTensor(gl, [im.width, im.height, 4 * 4, 2]);

    ColorMirror(hyperdoge, { image: multidoge });
    hyperdoge.show();
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkb2dlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7O0FDQUEsSUFBSSxLQUFLLEdBQUcsUUFBSCxFQUFUO0FBQUEsSUFDSSxlQUFlLEdBQUcsWUFEdEI7QUFBQSxJQUVJLFNBQVMsR0FBRyxNQUZoQjtBQUFBLElBR0ksZ0JBQWdCLEdBQUcsYUFIdkI7QUFBQSxJQUlJLEtBQUssU0FBTCxFQUFLO0FBQUEsV0FBSyxVQUFDLEdBQUQsRUFBTSxHQUFOO0FBQUEsZUFBYyxHQUFHLEdBQUgsQ0FBTyxFQUFFLElBQUYsQ0FBTyxFQUFQLENBQVAsRUFBbUIsR0FBbkIsRUFBd0IsR0FBeEIsQ0FBZDtBQUFBLEtBQUw7QUFBQSxDQUpUOztBQU9BLE9BQU8sRUFBUCxHQUFZLEVBQVo7O0FBRUEsSUFBTSxlQUFlLEVBQWYsaUJBQU47O0FBYUEsSUFBTSxZQUFZLEVBQVosa0JBQU47O0FBVUEsSUFBTSxjQUFjLEVBQWQsa0JBQU47O0FBWUEsR0FBRyxNQUFILENBQVUsS0FBVixHQUFrQixHQUFsQjtBQUNBLEdBQUcsTUFBSCxDQUFVLE1BQVYsR0FBbUIsR0FBbkI7O0FBR0EsU0FBUyxTQUFULENBQW1CLEdBQW5CLEVBQXdCLEVBQXhCLEVBQTJCO0FBQ3ZCLFFBQUksUUFBUSxJQUFJLEtBQUosRUFBWjtBQUFBLFFBQ0ksU0FBUyxTQUFTLGFBQVQsQ0FBdUIsUUFBdkIsQ0FEYjtBQUFBLFFBRUksTUFBTSxPQUFPLFVBQVAsQ0FBa0IsSUFBbEIsQ0FGVjtBQUdBLFVBQU0sR0FBTixHQUFZLEdBQVo7QUFDQSxVQUFNLE1BQU4sR0FBZSxZQUFVO0FBQ3JCLGVBQU8sS0FBUCxHQUFlLE1BQU0sWUFBckI7QUFDQSxlQUFPLE1BQVAsR0FBZ0IsTUFBTSxhQUF0QjtBQUNBLFlBQUksU0FBSixDQUFjLEtBQWQsRUFBcUIsQ0FBckIsRUFBd0IsQ0FBeEI7QUFDQSxXQUFHLElBQUksWUFBSixDQUFpQixDQUFqQixFQUFvQixDQUFwQixFQUF1QixPQUFPLEtBQTlCLEVBQXFDLE9BQU8sTUFBNUMsQ0FBSDtBQUNILEtBTEQ7QUFNSDs7QUFHRCxVQUFVLFlBQVYsRUFBd0IsVUFBUyxFQUFULEVBQVk7QUFDaEM7QUFDQSxRQUFJLFFBQVEsUUFBUSxJQUFJLFlBQUosQ0FBaUIsR0FBRyxJQUFwQixDQUFSLEVBQW1DLENBQUMsR0FBRyxLQUFKLEVBQVcsR0FBRyxNQUFkLEVBQXNCLENBQXRCLENBQW5DLENBQVo7QUFDQSxVQUFNLE1BQU4sQ0FBYSxLQUFiLEVBQW9CLEdBQXBCO0FBQ0EsV0FBTyxJQUFQLEdBQWMsSUFBSSxNQUFKLENBQVcsRUFBWCxFQUFlLE1BQU0sU0FBTixDQUFnQixDQUFoQixFQUFtQixDQUFuQixFQUFzQixDQUF0QixDQUFmLENBQWQ7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLFdBQU8sU0FBUCxHQUFtQixJQUFJLFlBQUosQ0FBaUIsRUFBakIsRUFBcUIsQ0FBQyxHQUFHLEtBQUosRUFBVyxHQUFHLE1BQWQsRUFBc0IsSUFBSSxDQUExQixDQUFyQixDQUFuQjtBQUNBLGlCQUFhLFNBQWIsRUFBd0IsRUFBRSxPQUFPLElBQVQsRUFBeEI7O0FBRUEsV0FBTyxTQUFQLEdBQW1CLElBQUksWUFBSixDQUFpQixFQUFqQixFQUFxQixDQUFDLEdBQUcsS0FBSixFQUFXLEdBQUcsTUFBZCxFQUFzQixJQUFJLENBQTFCLEVBQTZCLENBQTdCLENBQXJCLENBQW5COztBQUVBLGdCQUFZLFNBQVosRUFBdUIsRUFBRSxPQUFPLFNBQVQsRUFBdkI7QUFDQSxjQUFVLElBQVY7QUFFSCxDQXBCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgZ2wgPSBLVi5jcmVhdGVHTCgpLFxuICAgIE91dHB1dFRlbnNvciA9IEtWLk91dHB1dFRlbnNvcixcbiAgICBUZW5zb3IgPSBLVi5UZW5zb3IsXG4gICAgSW5QbGFjZVRlbnNvciA9IEtWLkluUGxhY2VUZW5zb3IsXG4gICAgVFAgPSBzID0+IChvdXQsIG9wdCkgPT4gS1YuUnVuKHMuam9pbignJyksIG91dCwgb3B0KTtcblxuXG5nbG9iYWwuZ2wgPSBnbDtcblxuY29uc3QgQ29sb3JpemVRdWFkID0gVFBgXG4gICAgdW5pZm9ybSBUZW5zb3IgaW1hZ2U7XG5cbiAgICB2ZWM0IHByb2Nlc3MoaXZlYzQgcG9zKSB7XG4gICAgICAgIGlmKHBvcy56ID09IDMpe1xuICAgICAgICAgICAgZmxvYXQgayA9IGRvdChyZWFkVGVuc29yKGltYWdlLCBpdmVjNChwb3MueHksIDAsIDApKSwgdmVjNCgwLjIxMjE2LCAwLjcxNTIsIDAuMDcyMiwgMCkpOyAgICBcbiAgICAgICAgICAgIHJldHVybiB2ZWM0KGssIGssIGssIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWFkVGVuc29yKGltYWdlLCBpdmVjNChwb3MueHksIDAsIDApKSBcbiAgICAgICAgICAgICogdmVjNChwb3Muej09MD8yOjEsIHBvcy56PT0xPzI6MSwgcG9zLno9PTI/MjoxLCAxKTtcbiAgICB9XG5gXG5cbmNvbnN0IFJhd01pcnJvciA9IFRQYFxuICAgIHVuaWZvcm0gVGVuc29yIGltYWdlO1xuXG4gICAgdmVjNCBwcm9jZXNzKGl2ZWM0IHBvcykge1xuICAgICAgICByZXR1cm4gdmVjNCh2ZWMyKHBvcy54eSkgLyAyNTYuMCwgMCwgMSk7XG4gICAgICAgIC8vIHJldHVybiB0ZXh0dXJlMkQoaW1hZ2UudGV4LCB2ZWMyKHBvcy54eSkgLyB2ZWMyKF9vdXRwdXRTaGFwZS54eSkpO1xuICAgIH1cbmA7XG5cblxuY29uc3QgQ29sb3JNaXJyb3IgPSBUUGBcbiAgICB1bmlmb3JtIFRlbnNvciBpbWFnZTtcblxuICAgIHZlYzQgcHJvY2VzcyhpdmVjNCBwb3MpIHtcbiAgICAgICAgaWYocG9zLncgPT0gMCl7XG4gICAgICAgICAgICByZXR1cm4gcmVhZFRlbnNvcihpbWFnZSwgaXZlYzQocG9zLnh5eiwgMCkpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiByZWFkVGVuc29yKGltYWdlLCBpdmVjNChwb3MueXh6LCAwKSk7XG4gICAgICAgIH1cbiAgICB9XG5gXG5cbmdsLmNhbnZhcy53aWR0aCA9IDUxMlxuZ2wuY2FudmFzLmhlaWdodCA9IDUxMlxuXG5cbmZ1bmN0aW9uIGxvYWRJbWFnZSh1cmwsIGNiKXtcbiAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UsXG4gICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBpbWFnZS5zcmMgPSB1cmw7XG4gICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgY2FudmFzLndpZHRoID0gaW1hZ2UubmF0dXJhbFdpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaW1hZ2UubmF0dXJhbEhlaWdodDtcbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMClcbiAgICAgICAgY2IoY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpKVxuICAgIH1cbn1cblxuXG5sb2FkSW1hZ2UoJy4vZG9nZS5qcGcnLCBmdW5jdGlvbihpbSl7XG4gICAgLy8gd2UgY2FuIGNvbnZlcnQgdGhlIGltYWdlIGRhdGEgaW50byBhbiBuZGFycmF5XG4gICAgdmFyIG5kb2dlID0gbmRhcnJheShuZXcgRmxvYXQzMkFycmF5KGltLmRhdGEpLCBbaW0ud2lkdGgsIGltLmhlaWdodCwgNF0pO1xuICAgIG5kb3BzLmRpdnNlcShuZG9nZSwgMjU1KVxuICAgIGdsb2JhbC5kb2dlID0gbmV3IFRlbnNvcihnbCwgbmRvZ2UudHJhbnNwb3NlKDEsIDAsIDIpKVxuXG4gICAgLy8gZ2xvYmFsLm1pcnJvciA9IG5ldyBPdXRwdXRUZW5zb3IoZ2wsIFtpbS53aWR0aCwgaW0uaGVpZ2h0LCA0XSk7XG4gICAgLy8gUmF3TWlycm9yKG1pcnJvciwgeyBpbWFnZTogZG9nZSB9KVxuXG4gICAgLy8gd2UgY2FuIGxvYWQgZGlyZWN0bHkgZnJvbSBpbWFnZWRhdGFcbiAgICAvLyBnbG9iYWwuZG9nZSA9IG5ldyBUZW5zb3IoZ2wsIGltKVxuXG4gICAgZ2xvYmFsLm11bHRpZG9nZSA9IG5ldyBPdXRwdXRUZW5zb3IoZ2wsIFtpbS53aWR0aCwgaW0uaGVpZ2h0LCA0ICogNF0pXG4gICAgQ29sb3JpemVRdWFkKG11bHRpZG9nZSwgeyBpbWFnZTogZG9nZSB9KVxuXG4gICAgZ2xvYmFsLmh5cGVyZG9nZSA9IG5ldyBPdXRwdXRUZW5zb3IoZ2wsIFtpbS53aWR0aCwgaW0uaGVpZ2h0LCA0ICogNCwgMl0pXG5cbiAgICBDb2xvck1pcnJvcihoeXBlcmRvZ2UsIHsgaW1hZ2U6IG11bHRpZG9nZSB9KVxuICAgIGh5cGVyZG9nZS5zaG93KClcblxufSkiXX0=
