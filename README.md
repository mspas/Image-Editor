## Usage

Install server and client dependencies

```
npm install
cd client
npm install
```

To start the server and client at the same time (from the root of the project)

```
npm run dev
```

Running the production build on localhost. This will create a production build, then Node will serve the app on http://localhost:3000

## Compiling C to WASM:

Emscripten - 2.0.14 ([installation guide](https://emscripten.org/docs/getting_started/downloads.html))

```
emcc editor.c -O3 --closure 1 --profiling -s FILESYSTEM=0 -g1 -s WASM=1 -s MALLOC=emmalloc -s TOTAL_MEMORY=300MB -s EXPORT_ES6=1 -s MODULARIZE=1 -s "EXPORT_NAME='Editor'" -s "ENVIRONMENT='web'" -s EXPORTED_FUNCTIONS="['_rotate180', '_mirror_reflection', '_rotate90', '_invert', '_brighten', '_gray_scale', '_crop', '_malloc']" --bind -o editorwasm.mjs
```

[With modified editorwasm.mjs output file to fit with React environment, just like here.](https://stackoverflow.com/a/60571821/9682898)

## Compiling C to ASM.JS:

```
emcc editor.c -O3 -s WASM=0 -s SINGLE_FILE=1 -s ENVIRONMENT=web -s TOTAL_MEMORY=300MB -s MODULARIZE=1 -s EXPORTED_FUNCTIONS="['_rotate180', '_mirror_reflection', '_rotate90', '_invert', '_brighten', '_gray_scale', '_crop', '_malloc', '_free']" -o editorasmjs.mjs
```
