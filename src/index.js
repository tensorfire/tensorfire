import ShowTexture from './show.js'

import { readFileSync } from 'fs';
import { join } from 'path';
const src = readFileSync(join(__dirname, 'float.glsl'), 'utf8');