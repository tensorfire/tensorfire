const ECHO_LOCATION = [`
    float process(ivec4 pos){
        if(imod(pos.z, 4) == 0){
            return float(pos.x);    
        }else if(imod(pos.z, 4) == 1){
            return float(pos.y);    
        }else if(imod(pos.z, 4) == 2){
            return float((pos.z / 4) * 4);    
        }else if(imod(pos.z, 4) == 3){
            return float(pos.w);
        }
    }
`, `
    vec4 process4(ivec4 pos){
        return vec4(pos);
    }
`];

const ECHO_LOCATION_X = [`
    float process(ivec4 pos){
        return float(pos.x);
    }
`, `
    vec4 process4(ivec4 pos){
        return vec4(pos);
    }
`];

const FLOAT_UNIFORM_FILL = [`
    uniform float color;
    float process(ivec4 pos){
        return color;
    }
`, `
    uniform float color;
    vec4 process4(ivec4 pos){
        return vec4(color, color, color, color);
    }
`]


const INCREMENT = [`
    uniform Tensor image;
    float process(ivec4 pos){
        return image.read(pos) + 1.0;
    }
`, `
    uniform Tensor image;
    vec4 process4(ivec4 pos){
        return image.read4(pos) + vec4(1, 1, 1, 1);
    }
`];


let TEST_PASSES = [],
    TEST_FAILS = [];

function runTestSuite(){
    if(sessionStorage.hasAlreadyRun) return;
    sessionStorage.hasAlreadyRun = true


    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    let gl = TF.createGL(canvas);

    testReference(gl, 'ECHO_LOCATION', [6, 5, 4], ECHO_LOCATION, {}, [[[0,0,0,0],[0,1,0,0],[0,2,0,0],[0,3,0,0],[0,4,0,0]],[[1,0,0,0],[1,1,0,0],[1,2,0,0],[1,3,0,0],[1,4,0,0]],[[2,0,0,0],[2,1,0,0],[2,2,0,0],[2,3,0,0],[2,4,0,0]],[[3,0,0,0],[3,1,0,0],[3,2,0,0],[3,3,0,0],[3,4,0,0]],[[4,0,0,0],[4,1,0,0],[4,2,0,0],[4,3,0,0],[4,4,0,0]],[[5,0,0,0],[5,1,0,0],[5,2,0,0],[5,3,0,0],[5,4,0,0]]])
    testReference(gl, 'ECHO_LOCATION_X', [6, 7], ECHO_LOCATION_X, {}, [[0,0,0,0,0,0,0],[1,1,1,1,1,1,1],[2,2,2,2,2,2,2],[3,3,3,3,3,3,3],[4,4,4,4,4,4,4],[5,5,5,5,5,5,5]])
    testReference(gl, 'FLOAT_UNIFORM_FILL', [3, 3], FLOAT_UNIFORM_FILL, { color: 0.2 }, [[0.2,0.2,0.2],[0.2,0.2,0.2],[0.2,0.2,0.2]])
    testReference(gl, 'FLOAT_UNIFORM_FILL', [2, 2], FLOAT_UNIFORM_FILL, { color: -170223 }, [[-170223,-170223],[-170223,-170223]])

    
    testShape(gl, [2, 2])
    testShape(gl, [4, 7])
    testShape(gl, [3, 2])
    testShape(gl, [8, 7])


    testShape(gl, [8, 7, 3])
    testShape(gl, [5, 3, 7])
    testShape(gl, [6, 2, 9])


    uploadTelemetryData({
        passes: TEST_PASSES,
        failures: TEST_FAILS
    })

    canvas.remove();
}



function testShape(gl, shape){
    var Z = zeros(shape); 
    for(var i = 0; i < Z.data.length; i++) 
        Z.data[i] = i; 

    var ztens = new TF.Tensor(gl, Z);
    let COPY_PARAMS = [undefined, 'float32', 'softfloat', 
        // { type: 'float32', pack: 'tile', density: '4:4', codec: 'raw', __recopy: true },
        // { type: 'uint8', pack: 'stride', density: '1:4', codec: 'fixnum', __recopy: true },
    ]
    for(let p of COPY_PARAMS){
        var copy = ztens.copy(p);
        // if(p && p.__recopy) copy = copy.copy('softfloat');
        approxEqual(copy.read(), Z, 'copy:' + shape.join('x') + ':' + copy.format.type + ':' + copy.format.pack + ':' + copy.format.density + ':' + copy.format.codec)    
    }
    
}


function testReference(gl, testName, outputSize, operation, params, reference){
    var out = new TF.OutputTensor(gl, outputSize);
    out.run(operation[0], params)
    if(reference){
        approxEqual(out.read(), ndpack(reference), testName + ':float')
    }else{
        var out0 = out.read()
    }

    out.run(operation[1], params)
    if(reference){
        approxEqual(out.read(), ndpack(reference), testName  + ':vec4')
    }else{
        approxEqual(out0, out.read(), testName + ':crossImpl')
        console.log(JSON.stringify(ndunpack(out0)))
    }

    out.destroy()
}


runTestSuite()




function uploadTelemetryData(payload) {
    var req = new XMLHttpRequest();
    req.open('POST', 'https://logs.tenso.rs/api/v1/submit');
    req.setRequestHeader("Content-Type", "application/json");
    var msg = {
        identifier: "tensorfire-v1",
        data: {
            ua: navigator.userAgent,
            gl: JSON.stringify(webglreport()), // TODO
            passed: JSON.stringify(payload.passes),
            failed: JSON.stringify(payload.failures),
            passes: payload.passes.length,
            failures: payload.failures.length,
        },
    }
    req.send(JSON.stringify(msg));
}


function approxEqual(a, b, label){
    if(equal(a, b, 0.0001, function(message){
        console.log(label)
        console.log(message)
        console.log(ndshow(a))
        console.log(ndshow(b))
        TEST_FAILS.push({
            name: label,
            message: message,
            a: ndunpack(a),
            b: ndunpack(b)
        })
    })){
        TEST_PASSES.push(label)
    }
}


function arraysEqual (a,b) {
  var i;
  var la = a.length;
  var lb = b.length;
  if(la!==lb) return false;
  for(i=0; i<a.length; i++) {
    if( a[i] !== b[i] ) {
      return false;
    }
  }
  return true;
};



function output(callback,message,method,reason) {
  //console.log(message);
  if( callback !== undefined && typeof callback === 'function' ) {
    callback(message,method,reason);
  }
};


function equal(a,b, tol, onFalse) {
  var t;

  if( tol === undefined ) {
    tol = 0;
  }

  if( a.dimension !== b.dimension ) {
    output(onFalse,'approximatelyEqual():: a.dimension (= ' + a.dimension + ') !=   b.dimension (= ' + b.dimension + ')');
    return false;
  }

  if( ! arraysEqual(a.shape,b.shape) ) {
    output(onFalse, 'approximatelyEqual():: a.shape != b.shape');
    return false;
  }

  var diff = zeros(a.shape, 'float64');
  ndops.sub(diff, a, b);
  ndops.abseq(diff);
  var nrm = ndops.sup(diff);

  if( nrm > Math.max(0,tol) ) {
    output(onFalse, 'approximatelyEqual():: max element of A - B (= ' + nrm + ') > ' + tol);
    return false;
  }

  var sum = ndops.sum(diff);

  if( isNaN(sum) ) {
    output(onFalse, 'approximatelyEqual():: matrix contains NaN');
    return false;
  }

  return true;
};

function webglreport() {
    // via https://github.com/AnalyticalGraphicsInc/webglreport
    var report = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
    };
    if (!window.WebGLRenderingContext) {
        return;
    }

    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    var gl, contextName;
    contextName = 'webgl';
    gl = canvas.getContext(contextName, { stencil: true });
    if (!gl) {
        contextName = 'experimental-webgl';
        gl = canvas.getContext(contextName, { stencil: true });
    }
    if (!gl) {
        return;
    }
    canvas.remove();

    function describeRange(value) {
        return '[' + value[0] + ', ' + value[1] + ']';
    }

    function getMaxAnisotropy() {
        var e = gl.getExtension('EXT_texture_filter_anisotropic')
            || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
            || gl.getExtension('MOZ_EXT_texture_filter_anisotropic');

        if (e) {
            var max = gl.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            // See Canary bug: https://code.google.com/p/chromium/issues/detail?id=117450
            if (max === 0) {
                max = 2;
            }
            return max;
        }
        return 'n/a';
    }

    function formatPower(exponent, verbose) {
        if (verbose) {
            return '' + Math.pow(2, exponent);
        } else {
            return '2<sup>' + exponent + '</sup>';
        }
    }

    function getPrecisionDescription(precision, verbose) {
        var verbosePart = verbose ? ' bit mantissa' : '';
        return '[-' + formatPower(precision.rangeMin, verbose) + ', ' + formatPower(precision.rangeMax, verbose) + '] (' + precision.precision + verbosePart + ')'
    }

    function getBestFloatPrecision(shaderType) {
        var high = gl.getShaderPrecisionFormat(shaderType, gl.HIGH_FLOAT);
        var medium = gl.getShaderPrecisionFormat(shaderType, gl.MEDIUM_FLOAT);
        var low = gl.getShaderPrecisionFormat(shaderType, gl.LOW_FLOAT);

        return {
            high: getPrecisionDescription(high, true),
            medium: getPrecisionDescription(medium, true),
            low: getPrecisionDescription(low, true),
        }
    }

    function getFloatIntPrecision(gl) {
        var high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        var s = (high.precision !== 0) ? 'highp/' : 'mediump/';

        high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT);
        s += (high.rangeMax !== 0) ? 'highp' : 'lowp';

        return s;
    }

    function isPowerOfTwo(n) {
        return (n !== 0) && ((n & (n - 1)) === 0);
    }

    function getAngle(gl) {
        var lineWidthRange = describeRange(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE));

        // Heuristic: ANGLE is only on Windows, not in IE, and not in Edge, and does not implement line width greater than one.
        var angle = ((navigator.platform === 'Win32') || (navigator.platform === 'Win64')) &&
            (gl.getParameter(gl.RENDERER) !== 'Internet Explorer') &&
            (gl.getParameter(gl.RENDERER) !== 'Microsoft Edge') &&
            (lineWidthRange === describeRange([1,1]));

        if (angle) {
            // Heuristic: D3D11 backend does not appear to reserve uniforms like the D3D9 backend, e.g.,
            // D3D11 may have 1024 uniforms per stage, but D3D9 has 254 and 221.
            //
            // We could also test for WEBGL_draw_buffers, but many systems do not have it yet
            // due to driver bugs, etc.
            if (isPowerOfTwo(gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)) && isPowerOfTwo(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS))) {
                return 'Yes, D3D11';
            } else {
                return 'Yes, D3D9';
            }
        }
        return 'No';
    }

    function getMajorPerformanceCaveat(contextName) {
        // Does context creation fail to do a major performance caveat?
        var canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
        var gl = canvas.getContext(contextName, { failIfMajorPerformanceCaveat : true });
        canvas.remove();

        if (!gl) {
            // Our original context creation passed.  This did not.
            return 'Yes';
        }

        if (typeof gl.getContextAttributes().failIfMajorPerformanceCaveat === 'undefined') {
            // If getContextAttributes() doesn't include the failIfMajorPerformanceCaveat
            // property, assume the browser doesn't implement it yet.
            return 'Not implemented';
        }

        return 'No';
    }

    function getDraftExtensionsInstructions() {
        if (navigator.userAgent.indexOf('Chrome') !== -1) {
            return 'To see draft extensions in Chrome, browse to about:flags, enable the "Enable WebGL Draft Extensions" option, and relaunch.';
        } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
            return 'To see draft extensions in Firefox, browse to about:config and set webgl.enable-draft-extensions to true.';
        }

        return '';
    }

    function getMaxColorBuffers(gl) {
        var maxColorBuffers = 1;
        var ext = gl.getExtension("WEBGL_draw_buffers");
        if (ext != null) 
            maxColorBuffers = gl.getParameter(ext.MAX_DRAW_BUFFERS_WEBGL);

        return maxColorBuffers;
    }

    function getUnmaskedInfo(gl) {
        var unMaskedInfo = {
            renderer: '',
            vendor: ''
        };

        var dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbgRenderInfo != null) {
            unMaskedInfo.renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
            unMaskedInfo.vendor   = gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL);
        }

        return unMaskedInfo;
    }

    var webglToEsNames = {
        'getInternalformatParameter' : 'getInternalformativ',
        'uniform1ui' : 'uniform',
        'uniform2ui' : 'uniform',
        'uniform3ui' : 'uniform',
        'uniform4ui' : 'uniform',
        'uniform1uiv' : 'uniform',
        'uniform2uiv' : 'uniform',
        'uniform3uiv' : 'uniform',
        'uniform4uiv' : 'uniform',
        'uniformMatrix2x3fv' : 'uniform',
        'uniformMatrix3x2fv' : 'uniform',
        'uniformMatrix2x4fv' : 'uniform',
        'uniformMatrix4x2fv' : 'uniform',
        'uniformMatrix3x4fv' : 'uniform',
        'uniformMatrix4x3fv' : 'uniform',
        'vertexAttribI4i' : 'vertexAttrib',
        'vertexAttribI4iv' : 'vertexAttrib',
        'vertexAttribI4ui' : 'vertexAttrib',
        'vertexAttribI4uiv' : 'vertexAttrib',
        'vertexAttribIPointer' : 'vertexAttribPointer',
        'vertexAttribDivisor' : 'vertexAttribDivisor',
        'createQuery' : 'genQueries',
        'deleteQuery' : 'deleteQueries',
        'endQuery' : 'beginQuery',
        'getQuery' : 'getQueryiv',
        'getQueryParameter' : 'getQueryObjectuiv',
        'samplerParameteri' : 'samplerParameter',
        'samplerParameterf' : 'samplerParameter',
        'clearBufferiv' : 'clearBuffer',
        'clearBufferuiv' : 'clearBuffer',
        'clearBufferfv' : 'clearBuffer',
        'clearBufferfi' : 'clearBuffer',
        'createSampler' : 'genSamplers',
        'deleteSampler' : 'deleteSamplers',
        'getSyncParameter' : 'getSynciv',
        'createTransformFeedback' : 'genTransformFeedbacks',
        'deleteTransformFeedback' : 'deleteTransformFeedbacks',
        'endTransformFeedback' : 'beginTransformFeedback',
        'getIndexedParameter' : 'get',
        'getActiveUniforms' : 'getActiveUniformsiv',
        'getActiveUniformBlockParameter' : 'getActiveUniformBlockiv',
        'createVertexArray' : 'genVertexArrays',
        'deleteVertexArray' : 'deleteVertexArrays'
    };

    function getWebGL2ExtensionUrl(name) {
        if (name === 'getBufferSubData') {
            return 'http://www.opengl.org/sdk/docs/man/docbook4/xhtml/glGetBufferSubData.xml';
        }

        if (webglToEsNames[name]) {
            name = webglToEsNames[name];
        }

        var filename = 'gl' + name[0].toUpperCase() + name.substring(1) + '.xhtml';
        return 'http://www.khronos.org/opengles/sdk/docs/man3/html/' + filename;
    }

    function getWebGL2Status(gl, contextName) {
        var webgl2Names = [
            'copyBufferSubData',
            'getBufferSubData',
            'blitFramebuffer',
            'framebufferTextureLayer',
            'getInternalformatParameter',
            'invalidateFramebuffer',
            'invalidateSubFramebuffer',
            'readBuffer',
            'renderbufferStorageMultisample',
            'texStorage2D',
            'texStorage3D',
            'texImage3D',
            'texSubImage3D',
            'copyTexSubImage3D',
            'compressedTexImage3D',
            'compressedTexSubImage3D',
            'getFragDataLocation',
            'uniform1ui',
            'uniform2ui',
            'uniform3ui',
            'uniform4ui',
            'uniform1uiv',
            'uniform2uiv',
            'uniform3uiv',
            'uniform4uiv',
            'uniformMatrix2x3fv',
            'uniformMatrix3x2fv',
            'uniformMatrix2x4fv',
            'uniformMatrix4x2fv',
            'uniformMatrix3x4fv',
            'uniformMatrix4x3fv',
            'vertexAttribI4i',
            'vertexAttribI4iv',
            'vertexAttribI4ui',
            'vertexAttribI4uiv',
            'vertexAttribIPointer',
            'vertexAttribDivisor',
            'drawArraysInstanced',
            'drawElementsInstanced',
            'drawRangeElements',
            'drawBuffers',
            'clearBufferiv',
            'clearBufferuiv',
            'clearBufferfv',
            'clearBufferfi',
            'createQuery',
            'deleteQuery',
            'isQuery',
            'beginQuery',
            'endQuery',
            'getQuery',
            'getQueryParameter',
            'createSampler',
            'deleteSampler',
            'isSampler',
            'bindSampler',
            'samplerParameteri',
            'samplerParameterf',
            'getSamplerParameter',
            'fenceSync',
            'isSync',
            'deleteSync',
            'clientWaitSync',
            'waitSync',
            'getSyncParameter',
            'createTransformFeedback',
            'deleteTransformFeedback',
            'isTransformFeedback',
            'bindTransformFeedback',
            'beginTransformFeedback',
            'endTransformFeedback',
            'transformFeedbackVaryings',
            'getTransformFeedbackVarying',
            'pauseTransformFeedback',
            'resumeTransformFeedback',
            'bindBufferBase',
            'bindBufferRange',
            'getIndexedParameter',
            'getUniformIndices',
            'getActiveUniforms',
            'getUniformBlockIndex',
            'getActiveUniformBlockParameter',
            'getActiveUniformBlockName',
            'uniformBlockBinding',
            'createVertexArray',
            'deleteVertexArray',
            'isVertexArray',
            'bindVertexArray'
        ];

        var webgl2 = (contextName.indexOf('webgl2') !== -1);

        var functions = [];
        var totalImplemented = 0;
        var length = webgl2Names.length;

        if (webgl2) {
            for (var i = 0; i < length; ++i) {
                var name = webgl2Names[i];
                var className = 'extension';
                if (webgl2 && gl[name]) {
                    ++totalImplemented;
                } else {
                    className += ' unsupported';
                }
                functions.push({ name: name, className: className });
            }
        }

        return {
            status : webgl2 ? (totalImplemented + ' of ' + length + ' new functions implemented.') :
                'webgl2 and experimental-webgl2 contexts not available.',
            functions : functions
        };
    }

    var webgl2Status = getWebGL2Status(gl, contextName);

    report = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        contextName: contextName,
        glVersion: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        unMaskedVendor: getUnmaskedInfo(gl).vendor,
        unMaskedRenderer: getUnmaskedInfo(gl).renderer,
        antialias:  gl.getContextAttributes().antialias ? 'Available' : 'Not available',
        angle: getAngle(gl),
        majorPerformanceCaveat: getMajorPerformanceCaveat(contextName),
        maxColorBuffers: getMaxColorBuffers(gl),
        redBits: gl.getParameter(gl.RED_BITS),
        greenBits: gl.getParameter(gl.GREEN_BITS),
        blueBits: gl.getParameter(gl.BLUE_BITS),
        alphaBits: gl.getParameter(gl.ALPHA_BITS),
        depthBits: gl.getParameter(gl.DEPTH_BITS),
        stencilBits: gl.getParameter(gl.STENCIL_BITS),
        maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
        maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
        maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
        maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        aliasedLineWidthRange: describeRange(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)),
        aliasedPointSizeRange: describeRange(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)),
        maxViewportDimensions: describeRange(gl.getParameter(gl.MAX_VIEWPORT_DIMS)),
        maxAnisotropy: getMaxAnisotropy(),
        vertexShaderBestPrecision: getBestFloatPrecision(gl.VERTEX_SHADER),
        fragmentShaderBestPrecision: getBestFloatPrecision(gl.FRAGMENT_SHADER),
        fragmentShaderFloatIntPrecision: getFloatIntPrecision(gl),

        extensions: gl.getSupportedExtensions(),
        draftExtensionsInstructions: getDraftExtensionsInstructions(),

        webgl2Status : webgl2Status.status,
        webgl2Functions : webgl2Status.functions
    };
    return report;
}