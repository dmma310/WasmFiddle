# WasmFiddle

## Objectives

1. Build page that allows input of C/C++/Rust source code.
2. Shows correct syntax highlighting
3. Has UI elements for different compilation options
4. Can hot-load compiled web assembly modules and then run and display the output in a box next to the source code input box.
5. Site is embeddable on other sites.
6. Provides necessary information for compilation outside of the service.

## Motivations

Build a web assembly equivalent of JSFiddle. Allow users to produce and edit code in the browser and immediately see the results in the browser. Site would enable quick prototyping in the browser, allow people to share online solutions to coding problems in these languages that can be viewed and run online. It will introduce new coders to web assembly. This could also become part of educational offerings, sites, and blog posts that teach programming in these compiled languages. Lessons covering aspects of programming can have embedded pages that have readers stop, write code applying the concepts just taught, and the output can be viewed and checked interactively online without requiring the reader to move code to a separate development server where it is compiled and executed and lets them try code out as they read and learn.

## GCP App URL

https://wasmfiddle-c-cpp-rust.uw.r.appspot.com

### NOTE: A 'setup.bash' is included as part of the app.yaml file. It is used when deploying to GCP to install required libraries.

## Additional Tools Needed

1. Wasmtime
    - https://github.com/bytecodealliance/wasmtime
	- Install folder containing precompiled binary at the root of this application.
	- Note the folder contains the version number i.e. 'wasmtime-v0.28.0-x86_64-linux'. You may need to update the WASMTIME_VERSION const variable in the helpers.js file.
2. Wasi sdk
    - https://github.com/WebAssembly/wasi-sdk
    - Install folder at root of this application
    - Note the folder will contain a version i.e. 'wasi-sdk-12.0'. You'll need to update the WASI_VERSION const variable in the helpers.js file.
3. Rust
    - https://github.com/bytecodealliance/wasmtime/blob/main/docs/WASI-tutorial.md#from-rust
    - https://rustwasm.github.io/docs/book/game-of-life/setup.html
4. Google Cloud Platform
    - After deploying to GCP, run 'setup.bash' in GCP environment to ensure all libraries are installed.
