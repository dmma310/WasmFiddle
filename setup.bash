#!/usr/bin/env bash

wasi_sdk_version="12.0"
wasmtime_version="v0.28.0"

if [ ! -d "wasi-sdk-$wasi_sdk_version" ] &> /dev/null; then
    echo "Installing wasi-sdk"
    wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${wasi_sdk_version::-2}/wasi-sdk-$wasi_sdk_version-linux.tar.gz > /dev/null 2>&1
    tar -xf wasi-sdk-$wasi_sdk_version-linux.tar.gz
    rm wasi-sdk-$wasi_sdk_version-linux.tar.gz
fi

if [ ! -d "wasmtime-$wasmtime_version-x86_64-linux" ] &> /dev/null; then
  echo "Installing wasmtime"
    wget https://github.com/bytecodealliance/wasmtime/releases/download/$wasmtime_version/wasmtime-$wasmtime_version-x86_64-linux.tar.xz > /dev/null 2>&1
    tar -xf wasmtime-$wasmtime_version-x86_64-linux.tar.xz
    rm wasmtime-$wasmtime_version-x86_64-linux.tar.xz
fi

if ! rustc --version &> /dev/null; then
  echo "Installing Rust"
  curl https://sh.rustup.rs -sSf | sh -s -- -y --profile minimal > /dev/null 2>&1
  ~/.cargo/bin/rustup target add wasm32-wasi > /dev/null 2>&1
fi