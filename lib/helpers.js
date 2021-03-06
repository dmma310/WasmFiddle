const { exec } = require('child_process');
const fs = require('fs');
const datastore = require('../server');
const WASI_VERSION = 'wasi-sdk-12.0';
const WASMTIME_VERSION = 'wasmtime-v0.28.0-x86_64-linux';
const CLANG = 'clang';
const CLANGPP = 'clang++';
const CODE = 'Code';

module.exports.execCode = async (language, options, code, callback) => {
    // Create temp C/C++/Rust file with random name, write code
    let file;
    try {
        file = await createFileWithCode(language, code); // return '/tmp/fh4f3.c'
    }
    catch (e) {
        return `Error: ${e}`;
    }
    finally {
        // Create and execute wasm file, return results, delete temp file
        await execFileWithWasm(file, language, options, output => {
            deleteTempFile(file);
            deleteTempFile(`${file.substr(0, file.indexOf('.'))}.wasm`);
            callback(output);
        });
    }
}

// Create the specified file type with random name and code contents
function createFileWithCode(language, code) {
    const file = `/tmp/${randomFileName(language)}`;
    fs.promises.writeFile(file, code);
    return file;
}

// Choose to execute wasm with Rust or C/C++
function execFileWithWasm(file, language, options, callback) {
    const wasmFile = `${file.substr(0, file.indexOf('.'))}.wasm`;
    let cmd;
    if (language === 'rust') {
        cmd = wasmCmd(language, '', file, wasmFile);
    }
    else {
        cmd = wasmCmd(language, options, file, wasmFile);
    }
    // Create and execute wasm file, return results
    return exec(cmd, (err, stdout, stderr) => {
        if (stderr) {
            return callback(`Error: ${stderr}`);
        }
        if (err) {
            return callback(`Error: ${err.cmd}`);
        }
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
function wasmCmd(language, options, file, wasmFile = null) {
    if (language === 'cpp') {
        return `${WASI_VERSION}/bin/${CLANGPP}\
    --sysroot=${WASI_VERSION}/share/wasi-sysroot\
    ${options} ${file} -o ${wasmFile}`;
    }
    if (language === 'c') {
        return `${WASI_VERSION}/bin/${CLANG}\
        --sysroot=${WASI_VERSION}/share/wasi-sysroot\
        ${options} ${file} -o ${wasmFile}`;
    }
    return `~/.cargo/bin/rustc --target wasm32-wasi ${file} -o ${wasmFile}`;
}

function execWasm(wasmFile, callback) {
    // Execute wasm file and return results
    return exec(`${WASMTIME_VERSION}/wasmtime ${wasmFile}`, (err, stdout, stderr) => {
        if (stderr) {
            console.log(stderr);
            return callback(`Error: ${stderr}`);
        }
        if (err) {
            return callback(`Error: ${err.cmd}`);
        }
        return callback(stdout);
    });
}

// Save code to database and send back the link
module.exports.saveCode = async (language, options, code, callback) => {
    var new_code;
    var key;
    var prom;
    try {
        key = datastore.key(CODE);
        new_code = {"lang": language, "code": code};
        prom = await datastore.save({"key":key, "data": new_code})
        .then(() => {return key})
        .catch(err => {return err});
        callback(prom);
    }
    catch (e) {
        return `Error: ${e}`;
    }
}