var mocha = require('mocha');
module.exports = MyReporter;

function MyReporter(runner) {
    mocha.reporters.Base.call(this, runner);
    var passed = [];
    var failed = [];
    var passes = 0;
    var failures = 0;

    runner.on('pass', function(test){
        passes++;
        var info = {
            title: test.title,
            timedOut: test.timedOut,
            duration: test.duration,
            state: test.state,
        };
        passed.push(info);
    });

    runner.on('fail', function(test, err){
        failures++;
        var info = {
            title: test.title,
            timedOut: test.timedOut,
            duration: test.duration,
            state: test.state,
            err: test.err,
        };
        failed.push(info);
    });

    runner.on('end', function(){
        var payload = {
            'passes': passes,
            'failures': failures,
            'passed': passed,
            'failed': failed,
        };
        sendReport(payload);
    });
}
