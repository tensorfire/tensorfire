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



describe('GPGPU', () => {

	var gl = headlessGL(100, 100, { preserveDrawingBuffer: true })
	// var out = new OutputTensor(gl, [5, 5, 4]);

	describe('Gaussian Elimination', function(){
		const EliminationStep = `
		    uniform Tensor mat;
		    uniform int k;

		    float process(ivec4 pos) {
		        if(pos.x > k){
		            if(pos.y > k){
		                return mat.read(pos) - mat.read(ivec4(k, pos.y, 0, 0)) *
		                    (mat.read(ivec4(pos.x, k, 0, 0)) / mat.read(ivec4(k, k, 0, 0)));
		            }else{
		                return 0.0;
		            }
		        }
		        return mat.read(pos);
		    }
		`;


		const BackSubstitute = `
		    uniform Tensor mat;
		    uniform int k;

		    float process(ivec4 pos) {
		        if(pos.x == k){
		            return mat.read(pos) / mat.read(ivec4(k, k, 0, 0));
		        }else{
		            return mat.read(pos) - mat.read(ivec4(k, pos.y, 0, 0)) *
		                (mat.read(ivec4(pos.x, k, 0, 0)) / mat.read(ivec4(k, k, 0, 0)));
		        }
		    }
		`;

		it('should run elimination on a simple matrix', () => {
			var mat = new InPlaceTensor(gl, ndpack([
			    [2, 1, -1, 8],
			    [-3, -1, 2, -11], 
			    [-2, 1, 2, -3]
			]))

			for(var k = 0; k < mat.shape[0]; k++){
			    mat.run(EliminationStep, { mat: mat, k: k })
			}

			for(var k = mat.shape[0] - 1; k >= 0; k--){
			    mat.run(BackSubstitute, { mat: mat, k: k })
			}

			assEqual(mat.read(), ndpack([[1,0,0,2],[0,1,0,3],[0,0,1,-1]]))
		})
	})



	describe('Fibonacci Sequence', function(){

		const MatrixMultiply = `
		    uniform Tensor a;
		    uniform Tensor b;
		   
		    float process(ivec4 pos) {
		        float sum = 0.0;
		        for(int k = 0; k < #(a.shape).y; k++){
		            sum += a.read(ivec4(pos.x, k, pos.wz))
		                 * b.read(ivec4(k, pos.y, pos.wz));
		        }
		        return sum;
		    }
		`;


		function MatrixPower(base, n){
			if(n <= 0) throw new Error("can not raise to zeroth power");

			var a = base.copy('float32', InPlaceTensor),
				res = a.copy('float32', InPlaceTensor);

			n--
			while(n > 0){
				if(n % 2 == 0){
					a.run(MatrixMultiply, { a: a, b: a })	
					n /= 2
				}
				res.run(MatrixMultiply, { a: res, b: a })
				n--
			}
			return res
		}


		it('should compute first 15 fibonacci numbers', () => {
			
			var Q = new Tensor(gl, ndpack([[1, 1], [1, 0]]));

			function ComputeNthFibonacci(n){
				return MatrixPower(Q, n).read().get(0, 1, 0, 0)
			}

			function testFib(){
				var nums = []
				for(var i = 1; i < 15; i++){
					nums.push(ComputeNthFibonacci(i))
				}
				return nums
			}


			assert.deepEqual(testFib(), [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377])	
		})

	})
})