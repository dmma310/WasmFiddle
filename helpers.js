const { exec } = require('child_process');
const fs = require('fs');
const WASI_VERSION = 'wasi-sdk-12.0';
const WASMTIME_VERSION = 'wasmtime-v0.28.0-x86_64-linux';
const CLANG = 'clang';
const CLANGPP = 'clang++';

module.exports.execCode = async (language, code, callback) => {
    // Create temp C/C++/Rust file with random name, write code
    let file;
    try {
        file = await createFileWithCode(language, code);
    }
    catch (e) {
        return `Error: ${e}`;
    }
    finally {
        await execFileWithWasm(file, language, output => {
            deleteTempFile(file);
            deleteTempFile(`${file.substr(0, file.indexOf('.'))}.wasm`);
            callback(output);
        });
    }
}

function createFileWithCode(language, code) {
    const file = `tmp/${randomFileName(language)}`;
    fs.promises.writeFile(file, code);
    return file;
}

function execFileWithWasm(file, language, callback) {
    const wasmFile = `${file.substr(0, file.indexOf('.'))}.wasm`;
    const wasmCmd = language === 'rust' ? rustWasmCmd() : wasiCmd(language, file, wasmFile);
    return exec(wasmCmd, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            callback(`Error: ${err.cmd}`);
            // return `Error: ${err.code}`;
        }
        else if (stderr) {
            console.log(stderr);
            callback(`Error: ${stderr}`);
        }
        else {
            // Execute wasm file and return results
            return exec(`${WASMTIME_VERSION}/wasmtime ${wasmFile}`, (err, stdout, stderr) => {
                if (err) {
                    callback(`Error: ${err.cmd}`);
                    // return `Error: ${err.code}`;
                }
                else if (stderr) {
                    console.log(stderr);
                    callback(`Error: ${stderr}`);
                }
                callback(stdout);
            });
        }
    });
}

function deleteTempFile(file) {
    fs.unlink(file, err => {
        if (err) {
            console.error(err)
            return
        }
    });
}

function randomFileName(extension = '') {
    // Return Base 36 string of length 5
    return extension === '' ?
        `${Math.random().toString(36).substring(2, 7)}` :
        `${Math.random().toString(36).substring(2, 7)}.${extension}`;
}

function wasiCmd(language, file, wasmFile) {
    if (language === 'cpp') {
        return `${WASI_VERSION}/bin/${CLANGPP}\
    --sysroot=${WASI_VERSION}/share/wasi-sysroot\
    ${file} -o ${wasmFile}`;
    }
    return `${WASI_VERSION}/bin/${CLANG}\
    --sysroot=${WASI_VERSION}/share/wasi-sysroot\
    ${file} -o ${wasmFile}`;
}

function rustWasmCmd() {

}