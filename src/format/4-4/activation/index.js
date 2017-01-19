import { readFileSync } from 'fs';

export default {
	hard_sigmoid: readFileSync(__dirname + '/hard_sigmoid.glsl', 'utf8'),
	linear: readFileSync(__dirname + '/linear.glsl', 'utf8'),
	relu: readFileSync(__dirname + '/relu.glsl', 'utf8'),
	rgb: readFileSync(__dirname + '/rgb.glsl', 'utf8'),
	sigmoid: readFileSync(__dirname + '/sigmoid.glsl', 'utf8'),
	tanh: readFileSync(__dirname + '/tanh.glsl', 'utf8'),
}