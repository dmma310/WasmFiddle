const { execSync } = require('child_process');

module.exports.setupEnv = () => {
    if (process.env.NODE_ENV !== 'dev') {
        installWasiSDK();
        installWasmtime();
        installRust();
    }
}

function installWasiSDK() {
    execSync('wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${wasi_sdk_version::-2}/wasi-sdk-$wasi_sdk_version-linux.tar.gz');
    execSync('tar -xf wasi-sdk-$wasi_sdk_version-linux.tar.gz');
    execSync('rm wasi-sdk-$wasi_sdk_version-linux.tar.gz');
    console.log('Wasi SDK installed');
}

function installWasmtime() {
    execSync('wget https://github.com/bytecodealliance/wasmtime/releases/download/$wasmtime_version/wasmtime-$wasmtime_version-x86_64-linux.tar.xz');
    execSync('tar -xf wasmtime-$wasmtime_version-x86_64-linux.tar.xz');
    execSync('rm wasmtime-$wasmtime_version-x86_64-linux.tar.xz');
    console.log('Wasmtime installed');
}

// Install Rust and add wasm32-wasi target
function installRust() {
    execSync('curl https://sh.rustup.rs -sSf | sh -s -- -y --profile minimal > /dev/null 2>&1');
    execSync('~/.cargo/bin/rustup target add wasm32-wasi > /dev/null 2>&1');
    console.log('Rust installed');
}
