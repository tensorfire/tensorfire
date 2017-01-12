(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _templateObject = _taggedTemplateLiteral(['\n    uniform Tensor image;\n\n    vec4 process(ivec4 pos) {\n        if(pos.z == 3){\n            float k = dot(readTensor(image, ivec4(pos.xy, 0, 0)), vec4(0.21216, 0.7152, 0.0722, 0));    \n            return vec4(k, k, k, 1);\n        }\n        return readTensor(image, ivec4(pos.xy, 0, 0)) \n            * vec4(pos.z==0?2:1, pos.z==1?2:1, pos.z==2?2:1, 1);\n    }\n'], ['\n    uniform Tensor image;\n\n    vec4 process(ivec4 pos) {\n        if(pos.z == 3){\n            float k = dot(readTensor(image, ivec4(pos.xy, 0, 0)), vec4(0.21216, 0.7152, 0.0722, 0));    \n            return vec4(k, k, k, 1);\n        }\n        return readTensor(image, ivec4(pos.xy, 0, 0)) \n            * vec4(pos.z==0?2:1, pos.z==1?2:1, pos.z==2?2:1, 1);\n    }\n']),
    _templateObject2 = _taggedTemplateLiteral(['\n    uniform Tensor image;\n\n    vec4 process(ivec4 pos) {\n        if(pos.w == 0){\n            return readTensor(image, ivec4(pos.xyz, 0));\n        }else{\n            return readTensor(image, ivec4(pos.yxz, 0));\n        }\n    }\n'], ['\n    uniform Tensor image;\n\n    vec4 process(ivec4 pos) {\n        if(pos.w == 0){\n            return readTensor(image, ivec4(pos.xyz, 0));\n        }else{\n            return readTensor(image, ivec4(pos.yxz, 0));\n        }\n    }\n']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var gl = KV.createGL(),
    OutputTensor = KV.OutputTensor,
    Tensor = KV.Tensor,
    InPlaceTensor = KV.InPlaceTensor,
    TP = function TP(s) {
    return function (out, opt) {
        return KV.Run(s.join(''), out, opt);
    };
};

var ColorizeQuad = TP(_templateObject);

var ColorMirror = TP(_templateObject2);

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
    // var ndoge = ndarray(new Float32Array(im.data), [im.width, im.height, 4]);
    // ndops.divseq(ndoge, 255)
    // doge = new Tensor(gl, ndoge.transpose(1, 0, 2))

    // we can load directly from imagedata
    doge = new Tensor(gl, im);

    multidoge = new OutputTensor(gl, [im.width, im.height, 4 * 4]);
    ColorizeQuad(multidoge, { image: doge });

    hyperdoge = new OutputTensor(gl, [im.width, im.height, 4 * 4, 2]);

    ColorMirror(hyperdoge, { image: multidoge });
    hyperdoge.show();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImRvZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0FDQUEsSUFBSSxLQUFLLEdBQUcsUUFBSCxFQUFUO0FBQUEsSUFDSSxlQUFlLEdBQUcsWUFEdEI7QUFBQSxJQUVJLFNBQVMsR0FBRyxNQUZoQjtBQUFBLElBR0ksZ0JBQWdCLEdBQUcsYUFIdkI7QUFBQSxJQUlJLEtBQUssU0FBTCxFQUFLO0FBQUEsV0FBSyxVQUFDLEdBQUQsRUFBTSxHQUFOO0FBQUEsZUFBYyxHQUFHLEdBQUgsQ0FBTyxFQUFFLElBQUYsQ0FBTyxFQUFQLENBQVAsRUFBbUIsR0FBbkIsRUFBd0IsR0FBeEIsQ0FBZDtBQUFBLEtBQUw7QUFBQSxDQUpUOztBQU9BLElBQU0sZUFBZSxFQUFmLGlCQUFOOztBQWNBLElBQU0sY0FBYyxFQUFkLGtCQUFOOztBQVlBLEdBQUcsTUFBSCxDQUFVLEtBQVYsR0FBa0IsR0FBbEI7QUFDQSxHQUFHLE1BQUgsQ0FBVSxNQUFWLEdBQW1CLEdBQW5COztBQUdBLFNBQVMsU0FBVCxDQUFtQixHQUFuQixFQUF3QixFQUF4QixFQUEyQjtBQUN2QixRQUFJLFFBQVEsSUFBSSxLQUFKLEVBQVo7QUFBQSxRQUNJLFNBQVMsU0FBUyxhQUFULENBQXVCLFFBQXZCLENBRGI7QUFBQSxRQUVJLE1BQU0sT0FBTyxVQUFQLENBQWtCLElBQWxCLENBRlY7QUFHQSxVQUFNLEdBQU4sR0FBWSxHQUFaO0FBQ0EsVUFBTSxNQUFOLEdBQWUsWUFBVTtBQUNyQixlQUFPLEtBQVAsR0FBZSxNQUFNLFlBQXJCO0FBQ0EsZUFBTyxNQUFQLEdBQWdCLE1BQU0sYUFBdEI7QUFDQSxZQUFJLFNBQUosQ0FBYyxLQUFkLEVBQXFCLENBQXJCLEVBQXdCLENBQXhCO0FBQ0EsV0FBRyxJQUFJLFlBQUosQ0FBaUIsQ0FBakIsRUFBb0IsQ0FBcEIsRUFBdUIsT0FBTyxLQUE5QixFQUFxQyxPQUFPLE1BQTVDLENBQUg7QUFDSCxLQUxEO0FBTUg7O0FBR0QsVUFBVSxZQUFWLEVBQXdCLFVBQVMsRUFBVCxFQUFZO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsV0FBTyxJQUFJLE1BQUosQ0FBVyxFQUFYLEVBQWUsRUFBZixDQUFQOztBQUVBLGdCQUFZLElBQUksWUFBSixDQUFpQixFQUFqQixFQUFxQixDQUFDLEdBQUcsS0FBSixFQUFXLEdBQUcsTUFBZCxFQUFzQixJQUFJLENBQTFCLENBQXJCLENBQVo7QUFDQSxpQkFBYSxTQUFiLEVBQXdCLEVBQUUsT0FBTyxJQUFULEVBQXhCOztBQUVBLGdCQUFZLElBQUksWUFBSixDQUFpQixFQUFqQixFQUFxQixDQUFDLEdBQUcsS0FBSixFQUFXLEdBQUcsTUFBZCxFQUFzQixJQUFJLENBQTFCLEVBQTZCLENBQTdCLENBQXJCLENBQVo7O0FBRUEsZ0JBQVksU0FBWixFQUF1QixFQUFFLE9BQU8sU0FBVCxFQUF2QjtBQUNBLGNBQVUsSUFBVjtBQUVILENBakJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBnbCA9IEtWLmNyZWF0ZUdMKCksXG4gICAgT3V0cHV0VGVuc29yID0gS1YuT3V0cHV0VGVuc29yLFxuICAgIFRlbnNvciA9IEtWLlRlbnNvcixcbiAgICBJblBsYWNlVGVuc29yID0gS1YuSW5QbGFjZVRlbnNvcixcbiAgICBUUCA9IHMgPT4gKG91dCwgb3B0KSA9PiBLVi5SdW4ocy5qb2luKCcnKSwgb3V0LCBvcHQpO1xuXG5cbmNvbnN0IENvbG9yaXplUXVhZCA9IFRQYFxuICAgIHVuaWZvcm0gVGVuc29yIGltYWdlO1xuXG4gICAgdmVjNCBwcm9jZXNzKGl2ZWM0IHBvcykge1xuICAgICAgICBpZihwb3MueiA9PSAzKXtcbiAgICAgICAgICAgIGZsb2F0IGsgPSBkb3QocmVhZFRlbnNvcihpbWFnZSwgaXZlYzQocG9zLnh5LCAwLCAwKSksIHZlYzQoMC4yMTIxNiwgMC43MTUyLCAwLjA3MjIsIDApKTsgICAgXG4gICAgICAgICAgICByZXR1cm4gdmVjNChrLCBrLCBrLCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVhZFRlbnNvcihpbWFnZSwgaXZlYzQocG9zLnh5LCAwLCAwKSkgXG4gICAgICAgICAgICAqIHZlYzQocG9zLno9PTA/MjoxLCBwb3Muej09MT8yOjEsIHBvcy56PT0yPzI6MSwgMSk7XG4gICAgfVxuYFxuXG5cbmNvbnN0IENvbG9yTWlycm9yID0gVFBgXG4gICAgdW5pZm9ybSBUZW5zb3IgaW1hZ2U7XG5cbiAgICB2ZWM0IHByb2Nlc3MoaXZlYzQgcG9zKSB7XG4gICAgICAgIGlmKHBvcy53ID09IDApe1xuICAgICAgICAgICAgcmV0dXJuIHJlYWRUZW5zb3IoaW1hZ2UsIGl2ZWM0KHBvcy54eXosIDApKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm4gcmVhZFRlbnNvcihpbWFnZSwgaXZlYzQocG9zLnl4eiwgMCkpO1xuICAgICAgICB9XG4gICAgfVxuYFxuXG5nbC5jYW52YXMud2lkdGggPSA1MTJcbmdsLmNhbnZhcy5oZWlnaHQgPSA1MTJcblxuXG5mdW5jdGlvbiBsb2FkSW1hZ2UodXJsLCBjYil7XG4gICAgdmFyIGltYWdlID0gbmV3IEltYWdlLFxuICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgaW1hZ2Uuc3JjID0gdXJsO1xuICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGltYWdlLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGltYWdlLm5hdHVyYWxIZWlnaHQ7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApXG4gICAgICAgIGNiKGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KSlcbiAgICB9XG59XG5cblxubG9hZEltYWdlKCcuL2RvZ2UuanBnJywgZnVuY3Rpb24oaW0pe1xuICAgIC8vIHdlIGNhbiBjb252ZXJ0IHRoZSBpbWFnZSBkYXRhIGludG8gYW4gbmRhcnJheVxuICAgIC8vIHZhciBuZG9nZSA9IG5kYXJyYXkobmV3IEZsb2F0MzJBcnJheShpbS5kYXRhKSwgW2ltLndpZHRoLCBpbS5oZWlnaHQsIDRdKTtcbiAgICAvLyBuZG9wcy5kaXZzZXEobmRvZ2UsIDI1NSlcbiAgICAvLyBkb2dlID0gbmV3IFRlbnNvcihnbCwgbmRvZ2UudHJhbnNwb3NlKDEsIDAsIDIpKVxuXG4gICAgLy8gd2UgY2FuIGxvYWQgZGlyZWN0bHkgZnJvbSBpbWFnZWRhdGFcbiAgICBkb2dlID0gbmV3IFRlbnNvcihnbCwgaW0pXG5cbiAgICBtdWx0aWRvZ2UgPSBuZXcgT3V0cHV0VGVuc29yKGdsLCBbaW0ud2lkdGgsIGltLmhlaWdodCwgNCAqIDRdKVxuICAgIENvbG9yaXplUXVhZChtdWx0aWRvZ2UsIHsgaW1hZ2U6IGRvZ2UgfSlcblxuICAgIGh5cGVyZG9nZSA9IG5ldyBPdXRwdXRUZW5zb3IoZ2wsIFtpbS53aWR0aCwgaW0uaGVpZ2h0LCA0ICogNCwgMl0pXG5cbiAgICBDb2xvck1pcnJvcihoeXBlcmRvZ2UsIHsgaW1hZ2U6IG11bHRpZG9nZSB9KVxuICAgIGh5cGVyZG9nZS5zaG93KClcblxufSkiXX0=
