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
        // Create and execute wasm file, return results
        await execFileWithWasm(file, language, output => {
            deleteTempFile(file);
            deleteTempFile(`${file.substr(0, file.indexOf('.'))}.wasm`);
            callback(output);
        });
    }
}

// Creates the specified file type with random name
function createFileWithCode(language, code) {
    const file = `tmp/${randomFileName(language)}`;
    fs.promises.writeFile(file, code);
    return file;
}

// Choose to execute wasm with Rust or C/C++
function execFileWithWasm(file, language, callback) {
    const wasmFile = `${file.substr(0, file.indexOf('.'))}.wasm`;
    if (language === 'rust') {
        return execRust(file, wasmFile, callback);
    }
    return execCCPP(language, file, wasmFile, callback);
}

// Execute wasm with C/C++
function execCCPP(language, file, wasmFile, callback) {
    // Generate wasm file with wasmtime, using the appropriate compiler
    const wasmCmd = wasmCmd(language, file, wasmFile);
    return exec(wasmCmd, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return callback(`Error: ${err.cmd}`);
        }
        if (stderr) {
            console.log(stderr);
            return callback(`Error: ${stderr}`);
        }
        // Execute wasm file and return results
        return execWasm(wasmFile, callback);
    });
}

// Delete file at specified location
function deleteTempFile(filePath) {
    fs.unlink(filePath, err => {
        if (err) {
            console.error(err);
            return;
        }
    });
}

// Create a file of specified extension with a random name that is 5 characters long
function randomFileName(extension = '') {
    // Return Base 36 string of length 5
    return extension === '' ?
        `${Math.random().toString(36).substring(2, 7)}` :
        `${Math.random().toString(36).substring(2, 7)}.${extension}`;
}

// Generate wasm file using wasmtime based on language
function wasmCmd(language, file, wasmFile = null) {
    if (language === 'cpp') {
        return `${WASI_VERSION}/bin/${CLANGPP}\
    --sysroot=${WASI_VERSION}/share/wasi-sysroot\
    ${file} -o ${wasmFile}`;
    }
    if (language === 'c') {
        return `${WASI_VERSION}/bin/${CLANG}\
        --sysroot=${WASI_VERSION}/share/wasi-sysroot\
        ${file} -o ${wasmFile}`;
    }
    return `rustup target add wasm32-wasi && rustc ${file} --target wasm32-wasi`;
}

// Use wasitime to execute and return results of Rust.wasm
// Source: https://github.com/bytecodealliance/wasmtime
function execRust(rustFile, wasmFile, callback) {
    const rustWasmCmd = wasmCmd('rust', rustFile);
    // Create and execute wasm file, return results
    return exec(rustWasmCmd, (err, stdout, stderr) => {
        if (err) {
            return callback(`Error: ${err.cmd}`);
        }
        if (stderr) {
            console.log(stderr);
            return callback(`Error: ${stderr}`);
        }
        return execWasm(wasmFile, callback);
    });
}

function execWasm(wasmFile, callback) {
    // Execute wasm file and return results
    return exec(`${WASMTIME_VERSION}/wasmtime ${wasmFile}`, (err, stdout, stderr) => {
        if (err) {
            return callback(`Error: ${err.cmd}`);
        }
        if (stderr) {
            console.log(stderr);
            return callback(`Error: ${stderr}`);
        }
        return callback(stdout);
    });
}