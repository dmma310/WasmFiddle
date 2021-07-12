const { exec } = require('child_process');
const fs = require('fs');
// const { TEMP_STRING_LEN, RUST_COMPILER, RUST_FILENAME, C_COMPILER, C_VERSION, CPP_COMPILER, CPP_VERSION } = require('./constants');

module.exports.execCode = (language, code) => {
    // Create temp C/C++/Rust file with random name, write code
    let file;
    try {
        file = createFileWithCode(language, code);
    }
    catch (e) {
        return `Error: ${e}`;
    }
    finally {
        const res = execFileWithWasm(file);
        deleteTempFile(file);
        return res;
    }
}

function createFileWithCode(language, code) {
    const file = `${randomFileName(language)}`;
    fs.writeFile(file, code, (err) => {
        if (err) throw err;
    });
    return file;
}

function execFileWithWasm(file) {
    const wasmFile = `${file.substr(0, file.indexOf('.') - 1)}.wasm`;
    return exec(`wasi-sdk-12.0/bin/clang\
 --sysroot=wasi-sdk-12.0/share/wasi-sysroot\
 ${file} -o ${wasmFile}`, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return `Error: ${err.cmd}`;
            // return `Error: ${err.code}`;
        }
        else if (stderr) {
            console.log(stderr);
            return `Error: ${stderr}`;
        }
        else {
            // Execute wasm file and return results
            return exec(`wasmtime ${wasmFile}`, (err, stdout, stderr) => {
                if (err) {
                    return `Error: ${err.cmd}`;
                    // return `Error: ${err.code}`;
                }
                else if (stderr) {
                    console.log(stderr);
                    return `Error: ${stderr}`;
                }
                return stdout;
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
