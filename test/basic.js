import assert from 'assert'
import { Tensor, OutputTensor, InPlaceTensor, Run, Compile } from '../src/index.js'
import headlessGL from "gl"
import ndt from 'ndarray-tests'
import ndpack from 'ndarray-pack'
import ndunpack from 'ndarray-unpack'
import ndshow from 'ndarray-show'
import ndarray from 'ndarray'

function assEqual(a, b){
	if(ndt.equal(a, b, 1e-5)){

	}else{
		throw new Error('Unequal NDArrays\nFound: \n' + ndshow(a) + '\nExpected: \n' + ndshow(b))
	}
}


const ECHO_LOCATION = `
	vec4 process(ivec4 pos){
		return vec4(pos);
	}
`;

describe('Basic', () => {

	var gl = headlessGL(100, 100, { preserveDrawingBuffer: true })
	var out = new OutputTensor(gl, [5, 5, 4]);

	describe('Input Validation', function(){
		it('should throw for non-string shader', function() {
			assert.throws(e => Run(null, out))
			assert.throws(e => Compile(null, out))
		});

		it('should throw for non-output tensor', function() {
			var input = new Tensor(gl, [5, 5])
			assert.throws(e => Run(ECHO_LOCATION, input))
			assert.throws(e => Compile(ECHO_LOCATION, input))
		});

		it('should throw for syntax error', function() {
			var input = new OutputTensor(gl, [5, 5])
			assert.throws(e => Run(ECHO_LOCATION + '-', input))
			assert.throws(e => Compile(ECHO_LOCATION + '-', input))
		});
	})
	
	it('should echo locations', function(){
		Run(ECHO_LOCATION, out)

		assEqual(out.read().pick(null, null, 0, 0), ndpack([ 
				[ 0, 0, 0, 0, 0 ],
				[ 1, 1, 1, 1, 1 ],
				[ 2, 2, 2, 2, 2 ],
				[ 3, 3, 3, 3, 3 ],
				[ 4, 4, 4, 4, 4 ] ]))
		assEqual(out.read().pick(null, null, 1, 0), ndpack([ 
				[ 0, 1, 2, 3, 4 ],
				[ 0, 1, 2, 3, 4 ],
				[ 0, 1, 2, 3, 4 ],
				[ 0, 1, 2, 3, 4 ],
				[ 0, 1, 2, 3, 4 ] ]));
	})
	
})