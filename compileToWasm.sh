#!/usr/bin/env bash

cargo new $1
cargo build --manifest-path=$1/Cargo.toml --target wasm32-wasi
wasmtime $1/target/wasm32-wasi/debug/$1.wasm