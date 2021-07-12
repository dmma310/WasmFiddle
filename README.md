# WasmFiddle

## Objectives
1. Build page that allows input of C/C++/Rust source code.
2. Shows correct syntax highlighting
3. Has UI elements for different compilation options
4. Can hot-load compiled web assembly modules and then run and display the output in a box next to the source code input box.
5. Site is embeddable on other sites.
6. Provides necessary information for compilation outside of the service.

## Motivations
Build a web assembly equivalent of JSFiddle. Allow for users to produce and edit code in the browser and immediately see the results in the browser. Site would enable quick prototyping in the browser, allow people to share online solutions to coding problems in these languages that can be viewed and run online. It will introduce new coders to web assembly. This could also become part of educational offerings, sites, and blog posts that teach programming in these compiled languages. Lessons covering aspects of programming can have embedded pages that have readers stop, write code applying the concepts just taught, and the output can be viewed and checked interactively online without requiring the reader to move code to a separate development server where it is compiled and executed and lets them try code out as they read and learn.

## GCP App URL
https://wasmfiddle-c-cpp-rust.uw.r.appspot.com

## Additional Tools Needed
1. wasmtime
    - https://github.com/bytecodealliance/wasmtime
2. wasi sdk
    - https://github.com/WebAssembly/wasi-sdk