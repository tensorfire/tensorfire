import * as pack_stride from './pack/stride/index.js'
import * as pack_tile from './pack/tile/index.js'

import * as codec_fixnum from './codec/fixnum/index.js'
import * as codec_softfloat from './codec/softfloat/index.js'

import activations from './activation/index.js'

import { readFileSync } from 'fs';

export default {
	pack: {
		stride: pack_stride,
		tile: pack_tile
	},

	read_shim: readFileSync(__dirname + '/pack/read_shim.glsl', 'utf8'),
	write_shim: readFileSync(__dirname + '/pack/write_shim.glsl', 'utf8'),

	codec: {
		fixnum: codec_fixnum,
		softfloat: codec_softfloat,
	},
	activations: activations
}