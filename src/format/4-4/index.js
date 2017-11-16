import * as pack_stride from './pack/stride/index.js'
import * as pack_tile from './pack/tile/index.js'

import * as codec_raw from './codec/raw/index.js'
import * as codec_linquant from './codec/linquant/index.js'

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
        raw: codec_raw,
        linquant: codec_linquant,
    },
    activations: activations
}