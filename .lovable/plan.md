

# Fix: Replace broken `@imgly/background-removal` with `@huggingface/transformers`

## Root Cause

The `@imgly/background-removal@1.7.0` library has an irreconcilable version mismatch between its JavaScript runtime and its CDN-hosted WASM binary files:

- The JS runtime (from npm) calls WASM functions like `_OrtGetInputName`, `_OrtGetOutputName`
- The CDN WASM binary expects a newer API function `_OrtGetInputOutputMetadata` that doesn't exist in ANY available `onnxruntime-web` npm release
- This is a bug in the library's CDN assets and cannot be fixed on our side

## Solution

Replace `@imgly/background-removal` + `onnxruntime-web` with `@huggingface/transformers`, which:

- Bundles its own ONNX runtime internally (no peer dependency mismatch possible)
- Works reliably with Vite out of the box
- Uses the `briaai/RMBG-1.4` model for high-quality background removal
- Automatically caches the model in the browser after first download

## Changes

### 1. Update dependencies (`package.json`)
- Remove: `@imgly/background-removal`, `onnxruntime-web`
- Add: `@huggingface/transformers`

### 2. Simplify Vite config (`vite.config.ts`)
- Remove `optimizeDeps.exclude` for onnxruntime-web
- Remove `build.rollupOptions.external` for onnxruntime-web/webgpu

### 3. Rewrite background removal logic (`src/lib/backgroundRemoval.ts`)
- Use `AutoModel` and `AutoProcessor` from `@huggingface/transformers` to load the `briaai/RMBG-1.4` model
- Load the model lazily (singleton) so it's downloaded once and cached
- Process images by running the model, extracting the alpha mask, and compositing the result onto a transparent canvas
- Keep the existing `resizeImage`, `RESOLUTION_PROFILES`, and public API (`removeImageBackground`) identical so `BackgroundRemovalView.tsx` needs no changes

### 4. No changes to UI
`BackgroundRemovalView.tsx` calls `removeImageBackground(file, resolution)` and receives a `Blob` back -- this contract stays the same.

## Technical Details

The new `removeImageBackground` function will:

```text
1. Resize image to resolution profile max dimension (existing logic)
2. Load briaai/RMBG-1.4 model + processor (cached singleton)
3. Run model inference to produce a segmentation mask
4. Composite: draw original image on canvas, apply mask as alpha channel
5. Export canvas as PNG Blob with transparency
```

The model is approximately 30 MB and downloads from Hugging Face Hub on first use, then is cached by the browser's Cache API automatically.

