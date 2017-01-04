// do you ever hope that perhaps index files should 
// actually be index files lacking any implementation 
// code? well, today you're in luck!

export { Tensor, OutputTensor, InPlaceTensor } from './tensor/index.js'
export { Run, Compile } from './runtime/index.js'
export { createGL } from './util.js'
