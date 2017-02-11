function TensorProgram(shader, out, uniforms){
    out.compile(shader, uniforms)
    return {
        output: out,
        run(options, callback){
            out.run(shader, uniforms, callback)
        },
        destroy(){
            out.destroy()
            for(let param in uniforms){
                if(uniforms[param] instanceof Tensor){
                    uniforms[param].destroy()
                }
            }
        }
    }
}


function InputLayer(gl, layer, deps, options){
    if(!options[layer.name]) throw new Error("Invalid input");
    var tensor = new OutputTensor(gl, options[layer.name]);
    return {
        output: tensor,
        run(options){
            if(options[layer.name]){
                tensor.update(options[layer.name])    
            }
        },
        destroy(){
            tensor.destroy()
        }
    }
}

// const FormatStatistics = [
//   {
//     "name": "main_input",
//     "min": 0,
//     "max": 255
//   },
//   {
//     "name": "convolution2d_1",
//     "min": -3626.10693359375,
//     "max": 3305.6865234375
//   },
//   {
//     "name": "batchnormalization_1_mean",
//     "min": -1715.647705078125,
//     "max": 1822.1619873046875
//   },
//   {
//     "name": "batchnormalization_1_residual",
//     "min": 3.637978807091713e-12,
//     "max": 10538415
//   },
//   {
//     "name": "batchnormalization_1_variance",
//     "min": 9247.154296875,
//     "max": 228804.765625
//   },
//   {
//     "name": "batchnormalization_1+activation_1",
//     "min": 0,
//     "max": 13.208250045776367
//   },
//   {
//     "name": "convolution2d_2",
//     "min": -88.34521484375,
//     "max": 63.568145751953125
//   },
//   {
//     "name": "batchnormalization_2_mean",
//     "min": -18.02031135559082,
//     "max": 12.497589111328125
//   },
//   {
//     "name": "batchnormalization_2_residual",
//     "min": 3.552713678800501e-13,
//     "max": 6276.134765625
//   },
//   {
//     "name": "batchnormalization_2_variance",
//     "min": 8.93504524230957,
//     "max": 102.31684112548828
//   },
//   {
//     "name": "batchnormalization_2+activation_2",
//     "min": 0,
//     "max": 11.939108848571777
//   },
//   {
//     "name": "convolution2d_3",
//     "min": -84.6211166381836,
//     "max": 85.77696990966797
//   },
//   {
//     "name": "batchnormalization_3_mean",
//     "min": -16.070049285888672,
//     "max": 13.691821098327637
//   },
//   {
//     "name": "batchnormalization_3_residual",
//     "min": 3.552713678800501e-13,
//     "max": 7013.689453125
//   },
//   {
//     "name": "batchnormalization_3_variance",
//     "min": 22.92977523803711,
//     "max": 124.43011474609375
//   },
//   {
//     "name": "batchnormalization_3+activation_3",
//     "min": 0,
//     "max": 13.623411178588867
//   },
//   {
//     "name": "convolution2d_4",
//     "min": -84.64530944824219,
//     "max": 124.49554443359375
//   },
//   {
//     "name": "batchnormalization_4_mean",
//     "min": -16.419282913208008,
//     "max": 27.900487899780273
//   },
//   {
//     "name": "batchnormalization_4_residual",
//     "min": 9.094947017729282e-13,
//     "max": 9428.6806640625
//   },
//   {
//     "name": "batchnormalization_4_variance",
//     "min": 19.818931579589844,
//     "max": 442.01885986328125
//   },
//   {
//     "name": "batchnormalization_4+activation_4",
//     "min": 0,
//     "max": 12.061802864074707
//   },
//   {
//     "name": "convolution2d_5",
//     "min": -78.44379425048828,
//     "max": 73.0664291381836
//   },
//   {
//     "name": "batchnormalization_5_mean",
//     "min": -17.426504135131836,
//     "max": 17.240392684936523
//   },
//   {
//     "name": "batchnormalization_5_residual",
//     "min": 1.8417267710901797e-11,
//     "max": 5685.9599609375
//   },
//   {
//     "name": "batchnormalization_5_variance",
//     "min": 16.863115310668945,
//     "max": 139.30795288085938
//   },
//   {
//     "name": "batchnormalization_5",
//     "min": -7.309256076812744,
//     "max": 6.503152847290039
//   },
//   {
//     "name": "merge_1",
//     "min": -7.309256076812744,
//     "max": 15.004384994506836
//   },
//   {
//     "name": "convolution2d_6",
//     "min": -153.66493225097656,
//     "max": 325.5685729980469
//   },
//   {
//     "name": "batchnormalization_6_mean",
//     "min": -15.474926948547363,
//     "max": 10.63546085357666
//   },
//   {
//     "name": "batchnormalization_6_residual",
//     "min": 6.386926543200389e-10,
//     "max": 110489.859375
//   },
//   {
//     "name": "batchnormalization_6_variance",
//     "min": 129.97276306152344,
//     "max": 2270.09814453125
//   },
//   {
//     "name": "batchnormalization_6+activation_5",
//     "min": 0,
//     "max": 9.897893905639648
//   },
//   {
//     "name": "convolution2d_7",
//     "min": -170.50607299804688,
//     "max": 132.15560913085938
//   },
//   {
//     "name": "batchnormalization_7_mean",
//     "min": -11.967262268066406,
//     "max": 9.921875953674316
//   },
//   {
//     "name": "batchnormalization_7_residual",
//     "min": 9.094947017729282e-13,
//     "max": 27261.111328125
//   },
//   {
//     "name": "batchnormalization_7_variance",
//     "min": 9.951315879821777,
//     "max": 147.45118713378906
//   },
//   {
//     "name": "batchnormalization_7",
//     "min": -17.087804794311523,
//     "max": 12.716047286987305
//   },
//   {
//     "name": "merge_2",
//     "min": -15.081731796264648,
//     "max": 14.879046440124512
//   },
//   {
//     "name": "convolution2d_8",
//     "min": -165.42617797851562,
//     "max": 532.8707885742188
//   },
//   {
//     "name": "batchnormalization_8_mean",
//     "min": -15.603959083557129,
//     "max": 12.526711463928223
//   },
//   {
//     "name": "batchnormalization_8_residual",
//     "min": 5.684341886080801e-10,
//     "max": 293142.65625
//   },
//   {
//     "name": "batchnormalization_8_variance",
//     "min": 97.04519653320312,
//     "max": 1572.54345703125
//   },
//   {
//     "name": "batchnormalization_8+activation_6",
//     "min": 0,
//     "max": 9.906005859375
//   },
//   {
//     "name": "convolution2d_9",
//     "min": -315.56597900390625,
//     "max": 321.25518798828125
//   },
//   {
//     "name": "batchnormalization_9_mean",
//     "min": -12.702116012573242,
//     "max": 10.204585075378418
//   },
//   {
//     "name": "batchnormalization_9_residual",
//     "min": 4.604316927725449e-12,
//     "max": 102291.90625
//   },
//   {
//     "name": "batchnormalization_9_variance",
//     "min": 7.37477970123291,
//     "max": 130.01266479492188
//   },
//   {
//     "name": "batchnormalization_9",
//     "min": -23.896930694580078,
//     "max": 29.545085906982422
//   },
//   {
//     "name": "merge_3",
//     "min": -19.339553833007812,
//     "max": 19.406970977783203
//   },
//   {
//     "name": "convolution2d_10",
//     "min": -221.14932250976562,
//     "max": 478.88665771484375
//   },
//   {
//     "name": "batchnormalization_10_mean",
//     "min": -16.542442321777344,
//     "max": 10.944856643676758
//   },
//   {
//     "name": "batchnormalization_10_residual",
//     "min": 5.684341886080802e-14,
//     "max": 229578.515625
//   },
//   {
//     "name": "batchnormalization_10_variance",
//     "min": 58.0169677734375,
//     "max": 1163.9898681640625
//   },
//   {
//     "name": "batchnormalization_10+activation_7",
//     "min": 0,
//     "max": 15.82600212097168
//   },
//   {
//     "name": "convolution2d_11",
//     "min": -534.5223999023438,
//     "max": 592.5685424804688
//   },
//   {
//     "name": "batchnormalization_11_mean",
//     "min": -6.993751525878906,
//     "max": 10.276752471923828
//   },
//   {
//     "name": "batchnormalization_11_residual",
//     "min": 2.0463630789890885e-12,
//     "max": 348560.4375
//   },
//   {
//     "name": "batchnormalization_11_variance",
//     "min": 4.2195611000061035,
//     "max": 220.74119567871094
//   },
//   {
//     "name": "batchnormalization_11",
//     "min": -43.378326416015625,
//     "max": 50.226585388183594
//   },
//   {
//     "name": "merge_4",
//     "min": -32.688446044921875,
//     "max": 39.732421875
//   },
//   {
//     "name": "convolution2d_12",
//     "min": -513.4615478515625,
//     "max": 785.3054809570312
//   },
//   {
//     "name": "batchnormalization_12_mean",
//     "min": -19.262622833251953,
//     "max": 6.411626815795898
//   },
//   {
//     "name": "batchnormalization_12_residual",
//     "min": 2.25611529458547e-10,
//     "max": 609637.875
//   },
//   {
//     "name": "batchnormalization_12_variance",
//     "min": 129.36819458007812,
//     "max": 1457.820068359375
//   },
//   {
//     "name": "batchnormalization_12+activation_8",
//     "min": 0,
//     "max": 17.36801528930664
//   },
//   {
//     "name": "convolution2d_13",
//     "min": -720.658447265625,
//     "max": 665.928466796875
//   },
//   {
//     "name": "batchnormalization_13_mean",
//     "min": -7.670976161956787,
//     "max": 8.608590126037598
//   },
//   {
//     "name": "batchnormalization_13_residual",
//     "min": 1.7195134205394424e-12,
//     "max": 521323.3125
//   },
//   {
//     "name": "batchnormalization_13_variance",
//     "min": 4.11276912689209,
//     "max": 212.0294647216797
//   },
//   {
//     "name": "batchnormalization_13",
//     "min": -80.00421905517578,
//     "max": 71.35077667236328
//   },
//   {
//     "name": "merge_5",
//     "min": -94.991455078125,
//     "max": 72.77928161621094
//   },
//   {
//     "name": "deconvolution2d_1",
//     "min": -341.80633544921875,
//     "max": 651.0524291992188
//   },
//   {
//     "name": "batchnormalization_14_mean",
//     "min": -5.647652626037598,
//     "max": 1.4636738300323486
//   },
//   {
//     "name": "batchnormalization_14_residual",
//     "min": 2.8776980798284058e-11,
//     "max": 428544.1875
//   },
//   {
//     "name": "batchnormalization_14_variance",
//     "min": 55.54350280761719,
//     "max": 219.10662841796875
//   },
//   {
//     "name": "batchnormalization_14+activation_9",
//     "min": 0,
//     "max": 71.03335571289062
//   },
//   {
//     "name": "deconvolution2d_2",
//     "min": -216.25164794921875,
//     "max": 593.9701538085938
//   },
//   {
//     "name": "batchnormalization_15_mean",
//     "min": -0.9807345867156982,
//     "max": 0.35006144642829895
//   },
//   {
//     "name": "batchnormalization_15_residual",
//     "min": 1.9984014443252818e-15,
//     "max": 353640.4375
//   },
//   {
//     "name": "batchnormalization_15_variance",
//     "min": 1.3400719165802002,
//     "max": 12.161338806152344
//   },
//   {
//     "name": "batchnormalization_15+activation_10",
//     "min": 0,
//     "max": 204.03343200683594
//   },
//   {
//     "name": "convolution2d_14",
//     "min": -2992.584228515625,
//     "max": 3003.136474609375
//   },
//   {
//     "name": "batchnormalization_16_mean",
//     "min": -4.172943115234375,
//     "max": -0.930151104927063
//   },
//   {
//     "name": "batchnormalization_16_residual",
//     "min": 2.0463630789890885e-10,
//     "max": 9024416
//   },
//   {
//     "name": "batchnormalization_16_variance",
//     "min": 363.3876037597656,
//     "max": 686.4163818359375
//   },
//   {
//     "name": "batchnormalization_16+activation_11",
//     "min": -1,
//     "max": 1
//   }
// ]


const FormatStatistics = [
  {
    "name": "input_1",
    "min": -113.67900085449219,
    "max": 150.99400329589844
  },
  {
    "name": "conv1+relu_conv1",
    "min": 0,
    "max": 835.7869873046875
  },
  {
    "name": "pool1",
    "min": 0,
    "max": 835.7869873046875
  },
  {
    "name": "fire2/squeeze1x1+fire2/relu_squeeze1x1",
    "min": 0,
    "max": 1087.8956298828125
  },
  {
    "name": "fire2/expand1x1+fire2/relu_expand1x1",
    "min": 0,
    "max": 528.5732421875
  },
  {
    "name": "fire2/expand3x3",
    "min": -1276.78955078125,
    "max": 982.8897705078125
  },
  {
    "name": "fire2/relu_expand3x3",
    "min": 0,
    "max": 982.8897705078125
  },
  {
    "name": "fire2/concat",
    "min": 0,
    "max": 982.8897705078125
  },
  {
    "name": "fire3/squeeze1x1+fire3/relu_squeeze1x1",
    "min": 0,
    "max": 958.9950561523438
  },
  {
    "name": "fire3/expand1x1+fire3/relu_expand1x1",
    "min": 0,
    "max": 481.03472900390625
  },
  {
    "name": "fire3/expand3x3",
    "min": -1245.5400390625,
    "max": 659.12255859375
  },
  {
    "name": "fire3/relu_expand3x3",
    "min": 0,
    "max": 659.12255859375
  },
  {
    "name": "fire3/concat",
    "min": 0,
    "max": 659.12255859375
  },
  {
    "name": "pool3",
    "min": 0,
    "max": 659.12255859375
  },
  {
    "name": "fire4/squeeze1x1+fire4/relu_squeeze1x1",
    "min": 0,
    "max": 1130.6966552734375
  },
  {
    "name": "fire4/expand1x1+fire4/relu_expand1x1",
    "min": 0,
    "max": 553.9724731445312
  },
  {
    "name": "fire4/expand3x3",
    "min": -1349.0439453125,
    "max": 1046.2935791015625
  },
  {
    "name": "fire4/relu_expand3x3",
    "min": 0,
    "max": 1046.2935791015625
  },
  {
    "name": "fire4/concat",
    "min": 0,
    "max": 1046.2935791015625
  },
  {
    "name": "fire5/squeeze1x1+fire5/relu_squeeze1x1",
    "min": 0,
    "max": 994.6986694335938
  },
  {
    "name": "fire5/expand1x1+fire5/relu_expand1x1",
    "min": 0,
    "max": 469.5686950683594
  },
  {
    "name": "fire5/expand3x3",
    "min": -1118.4071044921875,
    "max": 794.2552490234375
  },
  {
    "name": "fire5/relu_expand3x3",
    "min": 0,
    "max": 794.2552490234375
  },
  {
    "name": "fire5/concat",
    "min": 0,
    "max": 794.2552490234375
  },
  {
    "name": "pool5",
    "min": 0,
    "max": 794.2552490234375
  },
  {
    "name": "fire6/squeeze1x1+fire6/relu_squeeze1x1",
    "min": 0,
    "max": 1529.8265380859375
  },
  {
    "name": "fire6/expand1x1+fire6/relu_expand1x1",
    "min": 0,
    "max": 863.7772827148438
  },
  {
    "name": "fire6/expand3x3",
    "min": -1178.98486328125,
    "max": 815.5369873046875
  },
  {
    "name": "fire6/relu_expand3x3",
    "min": 0,
    "max": 815.5369873046875
  },
  {
    "name": "fire6/concat",
    "min": 0,
    "max": 863.7772827148438
  },
  {
    "name": "fire7/squeeze1x1+fire7/relu_squeeze1x1",
    "min": 0,
    "max": 1051.5531005859375
  },
  {
    "name": "fire7/expand1x1+fire7/relu_expand1x1",
    "min": 0,
    "max": 443.2496643066406
  },
  {
    "name": "fire7/expand3x3",
    "min": -789.2604370117188,
    "max": 668.0328979492188
  },
  {
    "name": "fire7/relu_expand3x3",
    "min": 0,
    "max": 668.0328979492188
  },
  {
    "name": "fire7/concat",
    "min": 0,
    "max": 668.0328979492188
  },
  {
    "name": "fire8/squeeze1x1+fire8/relu_squeeze1x1",
    "min": 0,
    "max": 593.4243774414062
  },
  {
    "name": "fire8/expand1x1+fire8/relu_expand1x1",
    "min": 0,
    "max": 234.11473083496094
  },
  {
    "name": "fire8/expand3x3",
    "min": -556.43896484375,
    "max": 530.8920288085938
  },
  {
    "name": "fire8/relu_expand3x3",
    "min": 0,
    "max": 530.8920288085938
  },
  {
    "name": "fire8/concat",
    "min": 0,
    "max": 530.8920288085938
  },
  {
    "name": "fire9/squeeze1x1+fire9/relu_squeeze1x1",
    "min": 0,
    "max": 531.1656494140625
  },
  {
    "name": "fire9/expand1x1+fire9/relu_expand1x1",
    "min": 0,
    "max": 284.14593505859375
  },
  {
    "name": "fire9/expand3x3",
    "min": -658.1574096679688,
    "max": 371.5225524902344
  },
  {
    "name": "fire9/relu_expand3x3",
    "min": 0,
    "max": 371.5225524902344
  },
  {
    "name": "fire9/concat",
    "min": 0,
    "max": 371.5225524902344
  },
  {
    "name": "conv10+relu_conv10",
    "min": 0,
    "max": 116.50133514404297
  },
  {
    "name": "globalaveragepooling2d_1",
    "min": 2.625295639038086,
    "max": 27.529251098632812
  },
  // {
  //   "name": "loss_expsum",
  //   "min": 1319031537664,
  //   "max": 1319031537664
  // },
  // {
  //   "name": "loss",
  //   "min": 1.0468782958572564e-11,
  //   "max": 0.6847723126411438
  // }
]

// C.network.map(k => {
//   var data = C.info[k.name].output.read();
//   return {
//     name: k.name,
//     min: ndops.inf(data),
//     max: ndops.sup(data)
//   }
// })

function getFormat(layer){

    var stats = FormatStatistics.find(k => k.name == layer.name)
    if(stats){
    return undefined
        // if(layer.name == 'batchnormalization_1_residual'){
        //     return undefined
        // }
        if(layer.name.endsWith('_residual')){
            // if(stats.max > 10000){
            //     return {type: "uint8", pack: "stride", density: "4:4", codec: "linquant", min: 0, max: 10000 }
            // }else{
            //     return {type: "uint8", pack: "stride", density: "4:4", codec: "linquant", min: 0, max: 2000 }
            // }
            
            // return undefined
        }
        if(layer.name.endsWith('_mean')){
            // return {type: "uint8", pack: "stride", density: "4:4", codec: "linquant", min: -7, max: 7 }
            // return undefined
        }
        if(layer.name.endsWith('_variance')){
            // return {type: "uint8", pack: "stride", density: "4:4", codec: "linquant", min: 0, max: 100000 }
            // return undefined
        }
        if(layer.name.startsWith('convolution2d_')){
            // return {type: "uint8", pack: "stride", density: "4:4", codec: "linquant", min: 0, max: 100000 }
            // return undefined
        }
        if(layer.name.startsWith('deconvolution2d_')){
            // return {type: "uint8", pack: "stride", density: "4:4", codec: "linquant", min: 0, max: 100000 }
            // return undefined
        }
        return {type: "uint8", pack: "stride", density: "4:4", codec: "linquant", min: stats.min, max: stats.max }
    }
    return undefined
}




function ComputeMean(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        const ivec2 tileSize = #(image.shape).xy;

        vec4 process4(ivec4 pos) {
            vec4 sum = vec4(0, 0, 0, 0);
            for(int x = 0; x < tileSize.x; x++){
                for(int y = 0; y < tileSize.y; y++){
                    sum += image.read4(ivec4(x, y, pos.z, 0));
                }
            }
            return sum / float(tileSize.x * tileSize.y);
        }
    `
    var meanTensor = new OutputTensor(gl, [1, 1, deps.image.shape[2]], getFormat(layer))
    
    return TensorProgram(SHADER, meanTensor, {
        image: deps.image,
        _activation: layer.activation
    })
}

// function SoftmaxHelper(gl, layer, deps){
//     const SHADER = `
//         uniform Tensor image;
//         const channels = (#(image.shape).z - 1) / 4 + 1;

//         vec4 process4(ivec4 pos) {
//             float maxVal = vec4(-10000);
//             float sumVal = vec4(0);

//             for(int i = 0; i < channels; i++){
//                 vec4 pix = image.read4(0, 0, i);
//                 maxVal = max(maxVal, pix);
//                 sumVal += pix;
//             }

//             return vec4(
//                 dot(sumVal, vec4(1)) / float(image.shape.z),
//                 max(max(pix.r, pix.g), max(pix.b, pix.a)),
//                 0, 0);
//         }
//     `
//     var softmaxHelper = new OutputTensor(gl, [1])
//     return TensorProgram(SHADER, softmaxHelper, {
//         image: deps.image
//     })
// }


function ExpSum(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;

        vec4 process4(ivec4 pos) {
            vec4 sumVal = vec4(0);
            for(int i = 0; i < #(image.shape).z; i+=4){
                sumVal += exp(image.read4(ivec4(0, 0, i, 0)));
            }
            return vec4(dot(sumVal, vec4(1)));
        }
    `
    console.assert(deps.image.shape[0] == 1)
    console.assert(deps.image.shape[1] == 1)
    console.assert(deps.image.shape[3] == 1)
    var softmaxHelper = new OutputTensor(gl, [1, 1, 4], getFormat(layer))
    return TensorProgram(SHADER, softmaxHelper, {
        image: deps.image
    })
}


function Softmax(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor helper;

        vec4 process4(ivec4 pos) {
            return exp(image.read4(pos)) / helper.read4(ivec4(0));
        }
    `
    console.assert(deps.helper.shape[0] == 1)
    console.assert(deps.helper.shape[1] == 1)
    console.assert(deps.helper.shape[2] == 4)
    console.assert(deps.helper.shape[3] == 1)

    var output = new OutputTensor(gl, deps.image.shape, getFormat(layer))

    return TensorProgram(SHADER, output, {
        image: deps.image,
        helper: deps.helper,
    })
}


function Sum(gl, layer, deps){
    const SHADER = `
        uniform Tensor a;
        uniform Tensor b;

        vec4 process4(ivec4 pos) {
            return a.read4(pos) + b.read4(pos);
        }
    `
    if(deps.a.shape.some((k, i) => k != deps.b.shape[i]))
        throw new Error('Mismatched shapes for sum');

    var output = new OutputTensor(gl, deps.a.shape, getFormat(layer))
    return TensorProgram(SHADER, output, {
        a: deps.a,
        b: deps.b,
        _activation: layer.activation
    })
}

function ZeroPadding2D(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform ivec2 padding;

        vec4 process4(ivec4 pos) {
            if(pos.x < padding.x || pos.y < padding.y){
                return vec4(0, 0, 0, 0);
            }else if(pos.x >= image.shape.x + padding.x 
                || pos.y >= image.shape.x + padding.y){
                return vec4(0, 0, 0, 0);
            }else{
                return image.read4(ivec4(pos.xy - padding.xy, pos.zw));    
            }
        }
    `
    if(layer.padding.length == 2){
        var padding = [
            layer.padding[0], layer.padding[0], 
            layer.padding[1], layer.padding[1]
        ];
    }else if(layer.padding.length == 4){
        var padding = layer.padding;
    }else{
        throw new Error('invalid padding length')
    }
    var output = new OutputTensor(gl, [
        deps.image.shape[0] + padding[0] + padding[1],
        deps.image.shape[1] + padding[2] + padding[3],
        deps.image.shape[2],
        deps.image.shape[3]])
    return TensorProgram(SHADER, output, {
        image: deps.image,
        padding: layer.padding,
        _activation: layer.activation
    })
}

function Activation(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;

        vec4 process4(ivec4 pos) {
            return image.read4(pos);
        }
    `
    console.assert(['tanh', 'relu'].includes(layer.activation))
    var output = new OutputTensor(gl, deps.image.shape, getFormat(layer))
    return TensorProgram(SHADER, output, {
        image: deps.image,
        _activation: layer.activation
    })
}


function unsqueeze (a, axis) {
    var shape, stride

    if (axis !== undefined && (!Number.isFinite(axis) || (axis % 1 !== axis))) {
        throw new Error('axis of dimension to unsqueeze must be an integer')
    }
    axis = axis === undefined ? a.shape.length : axis

    shape = a.shape.slice(0)
    stride = a.stride.slice(0)
    shape.splice(axis || 0, 0, 1)
    stride.splice(axis || 0, 0, (stride[axis] || 1) * (shape[axis + 1] || 1))

    return ndarray(a.data, shape, stride, a.offset)
}

function ChannelFullyConnected(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor weights;
        uniform Tensor bias;

        vec4 process4(ivec4 pos) {
            vec4 sum = bias.read4(ivec4(0, 0, pos.z, 0));

            for(int f = 0; f < #(image.shape).z; f += 4){
                vec4 inputPix = image.read4(ivec4(0, 0, f, 0));

                sum += inputPix.r * weights.read4(ivec4(0, 0, pos.z, f + 0))
                     + inputPix.g * weights.read4(ivec4(0, 0, pos.z, f + 1))
                     + inputPix.b * weights.read4(ivec4(0, 0, pos.z, f + 2))
                     + inputPix.a * weights.read4(ivec4(0, 0, pos.z, f + 3));
            }
            return sum;
        }
    `

    console.assert(deps.image.shape[0] == 1)
    console.assert(deps.image.shape[1] == 1)
    console.assert(deps.image.shape[3] == 1)
    console.assert(deps.image.shape[2] == layer.weights.shape[0])

    var bias = new Tensor(gl, unsqueeze(unsqueeze(layer.bias, 0), 0))


    console.assert(bias.shape[0] == 1)
    console.assert(bias.shape[1] == 1)
    console.assert(bias.shape[2] == layer.weights.shape[1])
        // [ 1, 1, layer.bias ])


    var weights = new Tensor(gl, unsqueeze(unsqueeze(layer.weights.transpose(1, 0), 0), 0))
        // [ 1, 1, layer.weights.shape[1], layer.weights.shape[0] ])

    console.assert(weights.shape[0] == 1)
    console.assert(weights.shape[1] == 1)
    console.assert(weights.shape[2] == layer.weights.shape[1])
    console.assert(weights.shape[3] == layer.weights.shape[0])

    var output = new OutputTensor(gl, [1, 1, layer.weights.shape[1]])

    return TensorProgram(SHADER, output, {
        image: deps.image,
        weights: weights,
        bias: bias,
        _activation: layer.activation
    })
}





function Deconvolve2D(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor kernel;

        uniform ivec2 imagePadding;
        uniform ivec2 imageSubsample;

        const ivec2 kernelTileSize = #(kernel.shape).xy;

        vec4 process4(ivec4 pos){
            vec4 sum = vec4(0, 0, 0, 0);

            for(int f = 0; f < #(image.shape).z; f += 4){
                for(int kx = 0; kx < kernelTileSize.x; kx++){
                    int inputX = pos.x + kx - imagePadding.x;
                    if(imod(inputX, 2) != 0 || inputX < 0 || inputX >= int(image.shape.x) * 2) continue;

                    for(int ky = 0; ky < kernelTileSize.y; ky++){
                        int inputY = pos.y + ky - imagePadding.y;
                        if(imod(inputY, 2) != 0 || inputY < 0 || inputY >= int(image.shape.y) * 2) continue;

                        vec4 inputPix = image.read4(ivec4(inputX / 2, inputY / 2, f, 0));

                        sum += inputPix.r * kernel.read4(ivec4(kx, ky, pos.z, f + 0))
                             + inputPix.g * kernel.read4(ivec4(kx, ky, pos.z, f + 1))
                             + inputPix.b * kernel.read4(ivec4(kx, ky, pos.z, f + 2))
                             + inputPix.a * kernel.read4(ivec4(kx, ky, pos.z, f + 3));
                    }
                }
            }
            return sum;
        }
    `
    var kernelTensor = new Tensor(gl, layer.kernel.transpose(0, 1, 3, 2).step(-1, -1))

    var outputShape = [
        deps.image.shape[0] * layer.subsample[0], 
        deps.image.shape[1] * layer.subsample[1], 
        kernelTensor.shape[2]
    ];

    var output = new OutputTensor(gl, outputShape, getFormat(layer))
    return TensorProgram(SHADER, output, {
        image: deps.image,
        kernel: kernelTensor,
        imagePadding: layer.padding,
        imageSubsample: layer.subsample,
        _activation: layer.activation
    })
}


// function Deconvolve2D(gl, layer, deps){
//     const SHADER = `
//         uniform Tensor image;
//         uniform Tensor kernel;

//         uniform ivec2 imagePadding;
//         uniform ivec2 imageSubsample;

//         const ivec2 kernelTileSize = #(kernel.shape).xy;

//         float process(ivec4 pos){
//             float sum = 0.0;

//             for(int f = 0; f < #(image.shape).z; f++){
//                 for(int kx = 0; kx < kernelTileSize.x; kx++){
//                     int inputX = pos.x + kx - imagePadding.x;
//                     if(imod(inputX, 2) != 0 || inputX < 0 || inputX >= int(image.shape.x) * 2) continue;

//                     for(int ky = 0; ky < kernelTileSize.y; ky++){
//                         int inputY = pos.y + ky - imagePadding.y;
//                         if(imod(inputY, 2) != 0 || inputY < 0 || inputY >= int(image.shape.y) * 2) continue;

//                         float inputPix = image.read(ivec4(inputX / 2, inputY / 2, f, 0));
//                         sum += inputPix * kernel.read(ivec4(kx, ky, pos.z, f));
//                     }
//                 }
//             }
//             return sum;
//         }
//     `
//     var kernelTensor = new Tensor(gl, layer.kernel.transpose(0, 1, 3, 2).step(-1, -1))

//     var outputShape = [
//         deps.image.shape[0] * layer.subsample[0], 
//         deps.image.shape[1] * layer.subsample[1], 
//         kernelTensor.shape[2]
//     ];

//     var output = new OutputTensor(gl, outputShape)
//     return TensorProgram(SHADER, output, {
//         image: deps.image,
//         kernel: kernelTensor,
//         imagePadding: layer.padding,
//         imageSubsample: layer.subsample,
//         _activation: layer.activation
//     })
// }

function SquaredResidual(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor mean;

        vec4 process4(ivec4 pos){
            vec4 tileMean = mean.read4(ivec4(0, 0, pos.z, 0));
            vec4 pix = image.read4(pos);
            return pow(pix - tileMean, vec4(2, 2, 2, 2));
        }
    `
    console.assert(deps.mean.shape[0] == 1)
    console.assert(deps.mean.shape[1] == 1)
    console.assert(deps.image.shape[2] == deps.mean.shape[2])

    var residualTensor = new OutputTensor(gl, deps.image.shape, getFormat(layer))

    return TensorProgram(SHADER, residualTensor, {
        image: deps.image,
        mean: deps.mean,
        _activation: layer.activation
    })
}

function InstanceNormalize(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor mean;
        uniform Tensor variance;
        uniform Tensor beta;
        uniform Tensor gamma;

        const float eps = 0.00001;

        vec4 process4(ivec4 pos) {
            vec4 tileMean = mean.read4(ivec4(0, 0, pos.z, 0));
            vec4 tileStd = vec4(eps, eps, eps, eps) + sqrt(variance.read4(ivec4(0, 0, pos.z, 0)));
            vec4 tileBeta = beta.read4(ivec4(0, 0, pos.z, 0));
            vec4 tileGamma = gamma.read4(ivec4(0, 0, pos.z, 0));
            vec4 pix = image.read4(ivec4(pos.xyz, 0));
            return (pix - tileMean) / tileStd * tileGamma + tileBeta;
        }
    `

    var betaTensor = new Tensor(gl, ndarray(layer.beta.data, [1, 1, layer.beta.size]));
    var gammaTensor = new Tensor(gl, ndarray(layer.gamma.data, [1, 1, layer.gamma.size]));
    var normalizedTensor = new OutputTensor(gl, deps.image.shape, getFormat(layer))
    
    return TensorProgram(SHADER, normalizedTensor, { 
        image: deps.image, 
        mean: deps.mean, 
        variance: deps.variance, 

        beta: betaTensor,
        gamma: gammaTensor,
        _activation: layer.activation
    })
}


function BatchNormalize(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor beta;
        uniform Tensor gamma;

        vec4 process4(ivec4 pos) {
            return (image.read4(ivec4(pos.xyz, 0)) + 
                beta.read4(ivec4(0, 0, pos.z, 0))) * 
                gamma.read4(ivec4(0, 0, pos.z, 0));
        }
    `


    console.assert(layer.beta.size == layer.gamma.size)
    console.assert(layer.beta.size == deps.image.shape[2])

    var beta = new Float32Array(layer.beta.size),
        gamma = new Float32Array(layer.gamma.size);

    for(var i = 0; i < layer.beta.size; i++){
        var std_gamma = Math.sqrt(layer.running_std.get(i) + layer.epsilon) / layer.gamma.get(i);
        gamma[i] = 1 / std_gamma
        beta[i] = -layer.running_mean.get(i) + layer.beta.get(i) * std_gamma;
    }

    // var gamma = 1 / (tileStd * tileGamma);
    // var beta = -tileMean + tileBeta * (tileStd * tileGamma)

    // (pix - tileMean + tileBeta * (tileStd * tileGamma)) / tileStd * tileGamma

    // (x - mean) / (std / gamma) + beta
    // (x - mean + beta * (std / gamma)) / (std / gamma)
    // (x + BETA) * GAMMA
    // BETA = - mean + beta * (std / gamma)
    // GAMMA = 1 / (std / gamma)

    var betaTensor = new Tensor(gl, ndarray(beta, [1, 1, layer.beta.size]));
    var gammaTensor = new Tensor(gl, ndarray(gamma, [1, 1, layer.gamma.size]));
    var normalizedTensor = new OutputTensor(gl, deps.image.shape)

    return TensorProgram(SHADER, normalizedTensor, { 
        image: deps.image, 
        beta: betaTensor,
        gamma: gammaTensor,
        _activation: layer.activation
    })
}

// based on: https://github.com/transcranial/keras-js/blob/master/src/layers/convolutional/Convolution2D.js

function calcOutputShape(inputShape, kernelShape, subsample = [1, 1], borderMode = 'same') {
    const inputRows = inputShape[0]
    const inputCols = inputShape[1]
    const [nbRow, nbCol, inputChannels, outputChannels] = kernelShape

    const outputRows = borderMode === 'same'
      ? Math.floor((inputRows + subsample[0] - 1) / subsample[0])
      : Math.floor((inputRows - nbRow + subsample[0]) / subsample[0])
    const outputCols = borderMode === 'same'
      ? Math.floor((inputCols + subsample[1] - 1) / subsample[1])
      : Math.floor((inputCols - nbCol + subsample[1]) / subsample[1])

    const paddingRow = borderMode === 'same'
      ? Math.max(0, Math.floor((outputRows - 1) * subsample[0] + nbRow - inputRows))
      : 0
    const paddingCol = borderMode === 'same'
      ? Math.max(0, Math.floor((outputCols - 1) * subsample[1] + nbCol - inputCols))
      : 0
    const paddingRowBefore = Math.floor(paddingRow / 2)
    const paddingRowAfter = paddingRow - paddingRowBefore
    const paddingColBefore = Math.floor(paddingCol / 2)
    const paddingColAfter = paddingCol - paddingColBefore

    return {
        outputShape: [outputRows, outputCols, outputChannels],
        inputPadding: [paddingRowBefore, paddingColBefore]
    }
    // this.inputPadding = [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter]
}

function Convolve2D(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor kernel;
        
        uniform ivec2 imagePadding;
        uniform ivec2 imageSubsample;

        const ivec2 kernelTileSize = #(kernel.shape).xy;

        vec4 process4(ivec4 pos){
            vec4 sum = vec4(0, 0, 0, 0);

            for(int f = 0; f < #(image.shape).z; f += 4){
                for(int kx = 0; kx < kernelTileSize.x; kx++){
                    int inputX = pos.x * imageSubsample.x + kx - imagePadding.x;
                    if(inputX < 0 || inputX >= int(image.shape.x)) continue;

                    for(int ky = 0; ky < kernelTileSize.y; ky++){
                        int inputY = pos.y  * imageSubsample.y + ky - imagePadding.y;
                        if(inputY < 0 || inputY >= int(image.shape.y)) continue;

                        vec4 inputPix = image.read4(ivec4(inputX, inputY, f, 0));
                        
                        sum += inputPix.r * kernel.read4(ivec4(kx, ky, pos.z, f + 0))
                             + inputPix.g * kernel.read4(ivec4(kx, ky, pos.z, f + 1))
                             + inputPix.b * kernel.read4(ivec4(kx, ky, pos.z, f + 2))
                             + inputPix.a * kernel.read4(ivec4(kx, ky, pos.z, f + 3));
                    }
                }
            }
            return sum;
        }
    `
    console.assert(layer.kernel.shape[2] == deps.image.shape[2])
    var kernelTensor = new Tensor(gl, layer.kernel.transpose(0, 1, 3, 2))
    var { inputPadding, outputShape } = calcOutputShape(deps.image.shape, 
        [0, 1, 3, 2].map(k => kernelTensor.shape[k]), layer.subsample, layer.border_mode)
    var outputTensor = new OutputTensor(gl, outputShape, getFormat(layer))

    return TensorProgram(SHADER, outputTensor, {
        kernel: kernelTensor,
        image: deps.image,

        imagePadding: inputPadding,
        imageSubsample: layer.subsample,
        _activation: layer.activation
    })
}

// function Convolve2D(gl, layer, deps){
//     const SHADER = `
//         uniform Tensor image;
//         uniform Tensor kernel;
        
//         uniform ivec2 imagePadding;
//         uniform ivec2 imageSubsample;

//         const ivec2 kernelTileSize = #(kernel.shape).xy;

//         float process(ivec4 pos){
//             float sum = 0.0;

//             for(int f = 0; f < #(image.shape).z; f++){
//                 for(int kx = 0; kx < kernelTileSize.x; kx++){
//                     int inputX = pos.x * imageSubsample.x + kx - imagePadding.x;
//                     if(inputX < 0 || inputX >= int(image.shape.x)) continue;

//                     for(int ky = 0; ky < kernelTileSize.y; ky++){
//                         int inputY = pos.y  * imageSubsample.y + ky - imagePadding.y;
//                         if(inputY < 0 || inputY >= int(image.shape.y)) continue;

//                         float inputPix = image.read(ivec4(inputX, inputY, f, 0));
//                         sum += inputPix * kernel.read(ivec4(kx, ky, pos.z, f));
//                     }
//                 }
//             }
//             return sum;
//         }
//     `
//     console.assert(layer.kernel.shape[2] == deps.image.shape[2])
//     var kernelTensor = new Tensor(gl, layer.kernel.transpose(0, 1, 3, 2))
//     var { inputPadding, outputShape } = calcOutputShape(deps.image.shape, 
//         [0, 1, 3, 2].map(k => kernelTensor.shape[k]), layer.subsample, layer.border_mode)
//     var outputTensor = new OutputTensor(gl, outputShape)

//     return TensorProgram(SHADER, outputTensor, {
//         kernel: kernelTensor,
//         image: deps.image,

//         imagePadding: inputPadding,
//         imageSubsample: layer.subsample,
//         _activation: layer.activation
//     })
// }

function BiasConvolve2D(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor kernel;
        uniform Tensor bias;

        uniform ivec2 imagePadding;
        uniform ivec2 imageSubsample;

        const ivec2 kernelTileSize = #(kernel.shape).xy;

        vec4 process4(ivec4 pos){
            vec4 sum = bias.read4(ivec4(0, 0, pos.z, 0));

            for(int f = 0; f < #(image.shape).z; f += 4){
                for(int kx = 0; kx < kernelTileSize.x; kx++){
                    int inputX = pos.x * imageSubsample.x + kx - imagePadding.x;
                    if(inputX < 0 || inputX >= int(image.shape.x)) continue;

                    for(int ky = 0; ky < kernelTileSize.y; ky++){
                        int inputY = pos.y  * imageSubsample.y + ky - imagePadding.y;
                        if(inputY < 0 || inputY >= int(image.shape.y)) continue;

                        vec4 inputPix = image.read4(ivec4(inputX, inputY, f, 0));

                        sum += inputPix.r * kernel.read4(ivec4(kx, ky, pos.z, f + 0))
                             + inputPix.g * kernel.read4(ivec4(kx, ky, pos.z, f + 1))
                             + inputPix.b * kernel.read4(ivec4(kx, ky, pos.z, f + 2))
                             + inputPix.a * kernel.read4(ivec4(kx, ky, pos.z, f + 3));
                    }
                }
            }
            return sum;
        }
    `
    console.assert(layer.kernel.shape[2] == deps.image.shape[2])
    console.assert(layer.bias.shape[0] == layer.kernel.shape[3])

    var kernelTensor = new Tensor(gl, layer.kernel.transpose(0, 1, 3, 2))
    var biasTensor = new Tensor(gl, ndarray(layer.bias.data, [1, 1, layer.bias.size]));

    var { inputPadding, outputShape } = calcOutputShape(deps.image.shape, 
        [0, 1, 3, 2].map(k => kernelTensor.shape[k]), layer.subsample, layer.border_mode)
    var outputTensor = new OutputTensor(gl, outputShape, getFormat(layer))

    return TensorProgram(SHADER, outputTensor, {
        kernel: kernelTensor,
        bias: biasTensor,
        image: deps.image,

        imagePadding: inputPadding,
        imageSubsample: layer.subsample,
        _activation: layer.activation
    })
}



function MaxPooling2D(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        
        uniform ivec2 strides;
        uniform ivec2 padding;

        const ivec2 pool_size = #(_pool_size);

        vec4 process4(ivec4 pos){
            vec4 value = vec4(-10000, -10000, -10000, -10000);
            for(int kx = 0; kx < pool_size.x; kx++){
                int inputX = pos.x * strides.x + kx - padding.x;
                if(inputX < 0 || inputX >= int(image.shape.x)) continue;
                for(int ky = 0; ky < pool_size.y; ky++){
                    int inputY = pos.y  * strides.y + ky - padding.y;
                    if(inputY < 0 || inputY >= int(image.shape.y)) continue;
                    value = max(value, image.read4(ivec4(inputX, inputY, pos.z, pos.w)));
                }
            }
            return value;
        }
    `


    var { inputPadding, outputShape } = calcOutputShape(deps.image.shape, 
        [ layer.pool_size[0], layer.pool_size[1], -1, deps.image.shape[2]], 
        layer.strides, layer.border_mode)


    var outputTensor = new OutputTensor(gl, outputShape, getFormat(layer))
    return TensorProgram(SHADER, outputTensor, {
        image: deps.image,

        padding: inputPadding,
        _pool_size: layer.pool_size,
        strides: layer.strides,

        _activation: layer.activation
    })
}



function AveragePooling2D(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        
        uniform ivec2 strides;
        uniform ivec2 padding;

        const ivec2 pool_size = #(_pool_size);

        vec4 process4(ivec4 pos){
            vec4 value = vec4(0, 0, 0, 0);
            for(int kx = 0; kx < pool_size.x; kx++){
                int inputX = pos.x * strides.x + kx - padding.x;
                if(inputX < 0 || inputX >= int(image.shape.x)) continue;
                for(int ky = 0; ky < pool_size.y; ky++){
                    int inputY = pos.y  * strides.y + ky - padding.y;
                    if(inputY < 0 || inputY >= int(image.shape.y)) continue;
                    value += image.read4(ivec4(inputX, inputY, pos.z, pos.w));
                }
            }
            return value / float(pool_size.x * pool_size.y);
        }
    `


    var { inputPadding, outputShape } = calcOutputShape(deps.image.shape, 
        [ layer.pool_size[0], layer.pool_size[1], -1, deps.image.shape[2]], 
        layer.strides, layer.border_mode)

    var outputTensor = new OutputTensor(gl, outputShape)
    return TensorProgram(SHADER, outputTensor, {
        image: deps.image,

        padding: inputPadding,
        _pool_size: layer.pool_size,
        strides: layer.strides,

        _activation: layer.activation
    })
}


function ConcatChannel(gl, layer, deps){
    const SHADER = `
        uniform Tensor a;
        uniform Tensor b;

        vec4 process4(ivec4 pos) {
            if(pos.z < a.shape.z){
                return a.read4(pos);
            }else{
                return b.read4(ivec4(pos.xy, pos.z - a.shape.z, pos.w));
            }
        }
    `
    // the third channel must be divisible by 4 because
    // of the channel multiplexing stuff

    console.assert(deps.a.shape[2] % 4 == 0)
    console.assert(deps.b.shape[2] % 4 == 0)

    console.assert(deps.a.shape[0] == deps.b.shape[0])
    console.assert(deps.a.shape[1] == deps.b.shape[1])
    console.assert(deps.a.shape[3] == deps.b.shape[3])

    var output = new OutputTensor(gl, [
        deps.a.shape[0], deps.a.shape[1], 
        deps.a.shape[2] + deps.b.shape[2],
        deps.a.shape[3]], getFormat(layer));

    return TensorProgram(SHADER, output, {
        a: deps.a,
        b: deps.b,
        _activation: layer.activation
    })
}



const LAYER_TYPES = {
    InputLayer,
    ChannelFullyConnected,
    Convolve2D,
    BiasConvolve2D,
    Sum,
    ComputeMean,
    ExpSum,
    Softmax,
    MaxPooling2D,
    SquaredResidual,
    ZeroPadding2D,
    AveragePooling2D,
    InstanceNormalize,
    BatchNormalize,
    Activation,
    ConcatChannel,
    Deconvolve2D
}
