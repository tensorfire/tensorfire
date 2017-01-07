// code for pretty printing shader errors from regl

export function checkLinkError (gl, program, fragShader, vertShader, command) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var errLog = gl.getProgramInfoLog(program)
        var fragParse = parseSource(fragShader, command)
        var vertParse = parseSource(vertShader, command)

        var header = 'Error linking program with vertex shader, "' +
            vertParse[0].name + '", and fragment shader "' + fragParse[0].name + '"'

        if (typeof document !== 'undefined') {
            console.log('%c' + header + '\n%c' + errLog,
                'color:red;text-decoration:underline;font-weight:bold',
                'color:red')
        } else {
            console.log(header + '\n' + errLog)
        }
        throw new Error(header)
    }
}


export function checkShaderError (gl, shader, source, type, command) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var errLog = gl.getShaderInfoLog(shader)
        var typeName = type === gl.FRAGMENT_SHADER ? 'fragment' : 'vertex'
        // checkCommandType(source, 'string', typeName + ' shader source must be a string', command)

        var files = parseSource(source, command)
        var errors = parseErrorLog(errLog)
        annotateFiles(files, errors)

        Object.keys(files).forEach(function (fileNumber) {
            var file = files[fileNumber]
            if (!file.hasErrors) {
                return
            }

            var strings = ['']
            var styles = ['']

            function push (str, style) {
                strings.push(str)
                styles.push(style || '')
            }

            push('file number ' + fileNumber + ': ' + file.name + '\n', 'color:red;text-decoration:underline;font-weight:bold')

            file.lines.forEach(function (line) {
                if (line.errors.length > 0) {
                    push(leftPad(line.number, 4) + '|  ', 'background-color:yellow; font-weight:bold')
                    push(line.line + '\n', 'color:red; background-color:yellow; font-weight:bold')

                    // try to guess token
                    var offset = 0
                    line.errors.forEach(function (error) {
                        var message = error.message
                        var token = /^\s*\'(.*)\'\s*\:\s*(.*)$/.exec(message)
                        if (token) {
                            var tokenPat = token[1]
                            message = token[2]
                            switch (tokenPat) {
                                case 'assign':
                                    tokenPat = '='
                                    break
                            }
                            offset = Math.max(line.line.indexOf(tokenPat, offset), 0)
                        } else {
                            offset = 0
                        }

                        push(leftPad('| ', 6))
                        push(leftPad('^^^', offset + 3) + '\n', 'font-weight:bold')
                        push(leftPad('| ', 6))
                        push(message + '\n', 'font-weight:bold')
                    })
                    push(leftPad('| ', 6) + '\n')
                } else {
                    push(leftPad(line.number, 4) + '|  ')
                    push(line.line + '\n', 'color:red')
                }
            })
            if (typeof document !== 'undefined') {
                styles[0] = strings.join('%c')
                console.log.apply(console, styles)
            } else {
                console.log(strings.join(''))
            }
        })

        throw new Error('Error compiling ' + typeName + ' shader, ' + files[0].name)
    }
}

export function checkFramebufferError(gl){
    
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(status != gl.FRAMEBUFFER_COMPLETE){
        var statusCode = {}
        statusCode[gl.FRAMEBUFFER_COMPLETE] = 'complete'
        statusCode[gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT] = 'incomplete attachment'
        statusCode[gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS] = 'incomplete dimensions'
        statusCode[gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT] = 'incomplete, missing attachment'
        statusCode[gl.FRAMEBUFFER_UNSUPPORTED] = 'unsupported'
        throw new Error('framebuffer configuration not supported, status = ' + statusCode[status])
    }
}


function leftPad (str, n) {
    str = str + ''
    while (str.length < n) {
        str = ' ' + str
    }
    return str
}

function ShaderFile () {
    this.name = 'unknown'
    this.lines = []
    this.index = {}
    this.hasErrors = false
}

function ShaderLine (number, line) {
    this.number = number
    this.line = line
    this.errors = []
}

function ShaderError (fileNumber, lineNumber, message) {
    this.file = fileNumber
    this.line = lineNumber
    this.message = message
}

function parseSource (source, command) {
    var lines = source.split('\n')
    var lineNumber = 1
    var fileNumber = 0
    var files = {
        unknown: new ShaderFile(),
        0: new ShaderFile()
    }
    files.unknown.name = files[0].name = 'unknown'
    files.unknown.lines.push(new ShaderLine(0, ''))
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i]
        var parts = /^\s*\#\s*(\w+)\s+(.+)\s*$/.exec(line)
        if (parts) {
            switch (parts[1]) {
                case 'line':
                    var lineNumberInfo = /(\d+)(\s+\d+)?/.exec(parts[2])
                    if (lineNumberInfo) {
                        lineNumber = lineNumberInfo[1] | 0
                        if (lineNumberInfo[2]) {
                            fileNumber = lineNumberInfo[2] | 0
                            if (!(fileNumber in files)) {
                                files[fileNumber] = new ShaderFile()
                            }
                        }
                    }
                    break
                case 'define':
                    var nameInfo = /SHADER_NAME(_B64)?\s+(.*)$/.exec(parts[2])
                    if (nameInfo) {
                        files[fileNumber].name = (nameInfo[1]
                                ? decodeB64(nameInfo[2])
                                : nameInfo[2])
                    }
                    break
            }
        }
        files[fileNumber].lines.push(new ShaderLine(lineNumber++, line))
    }
    Object.keys(files).forEach(function (fileNumber) {
        var file = files[fileNumber]
        file.lines.forEach(function (line) {
            file.index[line.number] = line
        })
    })
    return files
}

function parseErrorLog (errLog) {
    var result = []
    errLog.split('\n').forEach(function (errMsg) {
        if (errMsg.length < 5) {
            return
        }
        var parts = /^ERROR\:\s+(\d+)\:(\d+)\:\s*(.*)$/.exec(errMsg)
        if (parts) {
            result.push(new ShaderError(
                parts[1] | 0,
                parts[2] | 0,
                parts[3].trim()))
        } else if (errMsg.length > 0) {
            result.push(new ShaderError('unknown', 0, errMsg))
        }
    })
    return result
}

function annotateFiles (files, errors) {
    errors.forEach(function (error) {
        var file = files[error.file]
        if (file) {
            var line = file.index[error.line]
            if (line) {
                line.errors.push(error)
                file.hasErrors = true
                return
            }
        }
        files.unknown.hasErrors = true
        files.unknown.lines[0].errors.push(error)
    })
}
