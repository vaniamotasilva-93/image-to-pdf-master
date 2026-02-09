

# Fix: ONNX Runtime Version Mismatch for Background Removal

## Root Cause

The `@imgly/background-removal@1.7.0` library requires a **specific dev build** of `onnxruntime-web`:

```
onnxruntime-web@1.21.0-dev.20250206-d981b153d3
```

The project currently installs `onnxruntime-web@^1.21.0` (stable release `1.21.0`). The WASM files served from the IMG.LY CDN were compiled against the dev build, so the stable runtime is missing internal ONNX functions -- causing the `_OrtGetInputOutputMetadata is not a function` error.

## Fix (single change)

**File: `package.json`** -- Pin `onnxruntime-web` to the exact dev version required by the library:

```
- "onnxruntime-web": "^1.21.0",
+ "onnxruntime-web": "1.21.0-dev.20250206-d981b153d3",
```

No other files need to change. The `publicPath`, `device: 'cpu'`, Vite config, and background removal logic all remain as-is.

## Why This Works

The WASM and ONNX model assets hosted on the IMG.LY CDN (`staticimgly.com`) were built and tested against this exact dev snapshot. When the runtime version matches, `_OrtGetInputOutputMetadata` and all other internal ONNX bindings are present and the session creates successfully.

