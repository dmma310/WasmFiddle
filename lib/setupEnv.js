const { exec } = require('child_process');

module.exports.setupEnv = () => {
    // Execute to install wasi sdk, wasmtime, rust
    exec('./setup.bash', (err, stdout, stderr) => {
        if (stderr) {
            throw (`Error: ${stderr}`);
        }
        if (err) {
            throw (`Error: ${err.cmd}`);
        }
        return stdout;
    });
}