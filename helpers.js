const { exec } = require('child_process');
const e = require('express');
const fs = require('fs');
const WASI_VERSION = 'wasi-sdk-12.0';
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
        await execFileWithWasm(file, output => {
            deleteTempFile(file);
            deleteTempFile(`${file.substr(0, file.indexOf('.'))}.wasm`);
            callback(output);
        });
    }
}

function createFileWithCode(language, code) {
    const file = `${randomFileName(language)}`;
    fs.promises.writeFile(file, code);
    return file;
}

function execFileWithWasm(file, language, callback) {
    const wasmFile = `${file.substr(0, file.indexOf('.'))}.wasm`;
    let cmd;
    if (language === 'c') {
        cmd = `${WASI_VERSION}/bin/${CLANG}\
        --sysroot=${WASI_VERSION}/share/wasi-sysroot\
        ${file} -o ${wasmFile}`;
    }
    else if (language === 'cpp') {
        cmd = `${WASI_VERSION}/bin/${CLANGPP}\
        --sysroot=${WASI_VERSION}/share/wasi-sysroot\
        ${file} -o ${wasmFile}`;
    }
    else {
        
    }
    return exec(cmd, (err, stdout, stderr) => {
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
            return exec(`wasmtime ${wasmFile}`, (err, stdout, stderr) => {
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
