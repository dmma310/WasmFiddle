#!/usr/bin/env bash

wasi_sdk_version="12.0"
wasmtime_version="v0.28.0"

if [ -d "wasi-sdk-$wasi_sdk_version" ]; then
  rm -rf "wasi-sdk-$wasi_sdk_version"
fi

if [ -d "wasmtime-$wasmtime_version-x86_64-linux" ]; then
  rm -rf "wasmtime-$wasmtime_version-x86_64-linux"
fi

if [ -d "rust" ]; then
  rm -rf "rust"
fi

echo "Installing wasi-sdk"
wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${wasi_sdk_version::-2}/wasi-sdk-$wasi_sdk_version-linux.tar.gz
tar -xf wasi-sdk-$wasi_sdk_version-linux.tar.gz
rm wasi-sdk-$wasi_sdk_version-linux.tar.gz

echo "Installing wasmtime"
wget https://github.com/bytecodealliance/wasmtime/releases/download/$wasmtime_version/wasmtime-$wasmtime_version-x86_64-linux.tar.xz
tar -xf wasmtime-$wasmtime_version-x86_64-linux.tar.xz
rm wasmtime-$wasmtime_version-x86_64-linux.tar.xz

echo "Installing rust"
mkdir rust
RUSTUP_HOME=./rust CARGO_HOME=./rust bash -c "curl https://sh.rustup.rs -sSf | sh -s -- -y"