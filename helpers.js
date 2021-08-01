const { exec, execSync } = require('child_process');
const fs = require('fs');
const datastore = require('./server.js');
const WASI_VERSION = 'wasi-sdk-12.0';
const WASMTIME_VERSION = 'wasmtime-v0.28.0-x86_64-linux';
const CLANG = 'clang';
const CLANGPP = 'clang++';
const CODE = "Code";

let rustInstalled = process.env.NODE_ENV === 'dev' ? true : false;

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

// **************************************************************************************************

// Choose to execute wasm with Rust or C/C++
function execFileWithWasm(file, language, options, callback) {
    const wasmFile = `${file.substr(0, file.indexOf('.'))}.wasm`;
    let cmd;
    if (language === 'rust') {
        if (!rustInstalled) installRust();
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

// Install Rust and add wasm32-wasi target
function installRust() {
    execSync('curl https://sh.rustup.rs -sSf | sh -s -- -y --profile minimal > /dev/null 2>&1');
    execSync('~/.cargo/bin/rustup target add wasm32-wasi > /dev/null 2>&1');
    console.log('Rust installed');
    rustInstalled = true;
}

// // Choose to execute wasm with Rust or C/C++
// function execFileWithWasm(file, language, options, callback) {
//     const wasmFile = `${file.substr(0, file.indexOf('.'))}.wasm`;
//     if (language === 'rust') {
//         return execRust(file, wasmFile, callback);
//     }
//     return execCCPP(language, options, file, wasmFile, callback);
// }

// // Use wasitime to execute and return results of Rust.wasm
// // Source: https://github.com/bytecodealliance/wasmtime
// function execRust(rustFile, wasmFile, callback) {
//     const rustWasmCmd = wasmCmd('rust', '', rustFile, wasmFile);
//     // Create and execute wasm file, return results
//     return exec(rustWasmCmd, (err, stdout, stderr) => {
//         if (stderr) {
//             console.log(stderr);
//             return callback(`Error: ${stderr}`);
//         }
//         if (err) {
//             return callback(`Error: ${err.cmd}`);
//         }
// 		return execWasm(wasmFile, callback);
//     });
// }

// // Execute wasm with C/C++
// function execCCPP(language, options, file, wasmFile, callback) {
//     // Generate wasm file with wasmtime, using the appropriate compiler
//     const cmd = wasmCmd(language, options, file, wasmFile);
//     return exec(cmd, (err, stdout, stderr) => {
//         if (stderr) {
//             console.log(stderr);
//             return callback(`Error: ${stderr}`);
//         }
//         if (err) {
//             console.log(err);
//             return callback(`Error: ${err.cmd}`);
//         }
//         // Execute wasm file and return results
//         return execWasm(wasmFile, callback);
//     });
// }

// **************************************************************************************************

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
module.exports.saveCode = async (language, code, callback) => {

    var new_code;
    var key;
    var prom;
    try {
        key = datastore.key(CODE);
        new_code = {"lang": language, "code": code};
        prom = await datastore.save({"key":key, "data": new_code}).then(() => {return key});
        callback(prom);
    }
    catch (e) {
        return `Error: ${e}`;
    }
}