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



describe('LSTM', () => {
	var gl = headlessGL(100, 100, { preserveDrawingBuffer: true })

	const LSTM = `
	    // Tensor output: [Ns, 1, 2]
	    uniform Tensor X; // [Ni, 1, 1]
	    uniform Tensor prev; // [Ns, 1, 2]
	    uniform Tensor W; // [Ns, Ns + Ni + 1, 4]
	    const int Ni = #(X.shape).x;
	    const int Ns = #(W.shape).x;

	    float tanh(float x){
	        float e = exp(2.0 * clamp(x, -10.0, 10.0) );
	        return (e-1.0)/(e+1.0);
	    }
	    float sigmoid(float x){ return 1.0/(1.0+exp(-clamp(x, -10.0, 10.0))); }
	    float hard_sigmoid(float x){ return clamp(x * 0.2 + 0.5, 0.0, 1.0); }

	    vec4 process4(ivec4 pos) {
	        int j = pos.x;
	        vec4 fioc = W.read4(j, 0); // bias
	        for(int k = 0; k < Ni; k++) // inputs
	            fioc += W.read4(j, 1 + k) * X.read4(k, 0).x; 
	        for(int k = 0; k < Ns; k++) // prev outputs
	            fioc += W.read4(j, 1 + Ni + k) * prev.read4(k, 0).x; 
	        float c_t = hard_sigmoid(fioc.x) * prev.read4(j, 0).y 
	                  + tanh(fioc.w) * hard_sigmoid(fioc.y); // state
	        float h_t = tanh(c_t) * hard_sigmoid(fioc.z); // output
	        return vec4(h_t, c_t, 0, 0);
	    }
	`

	// it('should run simple lstm', () => {
	// 	var W = ndpack([[[0.6,0.1,1,0.04],[-0.7183,0.6284,0.5941,0.7104],[0.1001,-0.0976,-0.804,-0.3719],[0.0921,0.5125,-0.5879,0.1168],[-0.7655,0.1102,0.0602,-0.3374],[-0.1515,-1.0289,-0.7254,0.4933],[0.5103,-0.0241,0.437,-0.8729],[-0.0921,0.0096,0.5247,0.0042],[0.9582,-0.3882,0.4663,0.4524]],[[0.07,0.3,1,0.3],[0.2044,-0.4727,0.5932,-0.2566],[-0.6546,-0.5244,0.8203,-0.2078],[0.2319,-0.3751,-0.1016,-0.6871],[0.6838,0.5261,-0.2267,-0.2175],[-0.1955,-0.0795,-0.193,-0.1454],[-0.9421,0.1664,0.6026,0.2862],[-0.2981,-1.0704,0.0305,0.7824],[0.4421,0.1739,-0.8993,0.7034]],[[1,0.2,1,0.6],[-0.4946,-0.6464,-0.269,0.5536],[0.5426,-0.6479,0.4009,0.7433],[-0.5261,0.7326,-0.7704,0.2899],[0.4105,0.3328,-0.5584,-0.2873],[-1.0713,-0.2447,0.6274,0.971],[0.0926,0.8523,0.0423,0.5046],[0.0999,0.2484,0.8994,0.073],[-0.2091,0.6016,-0.0757,-0.0858]],[[2,0.6,1,0.4],[0.0537,0.4429,-0.5176,0.5037],[0.28,-0.3403,0.4105,0.5882],[-0.5866,-0.0637,-0.0026,0.0702],[-0.6964,-0.3074,-0.0374,0.3402],[-0.0332,-0.2919,0.5029,-0.053],[0.2315,-0.6747,0.8088,0.3339],[-1.0501,0.0494,-0.3534,-0.7698],[-0.2295,0.8168,0.422,0.7093]]]);

	// 	const LSTMInput = ndpack([[0.1, 0.0, 0.9, 0.6], [0.5, 0.5, 0.5, 0.3]]);
	// 	const LSTMOutput = new Float64Array([0.15660709142684937, -0.12310830503702164, 0.3947620987892151, 0.4411243498325348]);

	// 	var Ns = 4,
	// 	    Ni = 4;

	// 	var input1 = new Tensor(gl, LSTMInput.pick(0, null)),
	// 		input2 = new Tensor(gl, LSTMInput.pick(1, null)),
	// 		weights = new Tensor(gl, W),
	// 		output = new InPlaceTensor(gl, [Ns, 1, 4]);

	// 	assEqual(weights.read(), W)

	// 	output.run(LSTM, { X: input1, W: weights, prev: output });
	// 	output.run(LSTM, { X: input2, W: weights, prev: output });

	// 	output.show()

	// 	console.log('Computed', ndshow(output.read().pick(null, 0, 0, 0)))
	// 	console.log('Reference', ndshow(ndarray(LSTMOutput)))	
	// })
	
})