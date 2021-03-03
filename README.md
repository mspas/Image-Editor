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
emcc editor.c -Os -g1 -s WASM=1 -s MALLOC=emmalloc -s ALLOW_MEMORY_GROWTH=1 -s EXPORT_ES6=1 -s MODULARIZE=1 -s "EXPORT_NAME='Editor'" -s "ENVIRONMENT='web'" -s EXPORTED_FUNCTIONS="['_doubler', '_test2', '_test3', '_rotate', '_malloc']" --bind -o editor.mjs
```

[With modified editor.mjs output file to fit with React environment, just like here.](https://stackoverflow.com/a/60571821/9682898)
