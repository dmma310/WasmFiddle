const { exec } = require('child_process');
const fs = require('fs');
// const { TEMP_STRING_LEN, RUST_COMPILER, RUST_FILENAME, C_COMPILER, C_VERSION, CPP_COMPILER, CPP_VERSION } = require('./constants');

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
        const res = await execFileWithWasm(file, output => {
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

function execFileWithWasm(file, callback) {
    const wasmFile = `${file.substr(0, file.indexOf('.'))}.wasm`;
    return exec(`wasi-sdk-12.0/bin/clang\
 --sysroot=wasi-sdk-12.0/share/wasi-sysroot\
 ${file} -o ${wasmFile}`, (err, stdout, stderr) => {
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
