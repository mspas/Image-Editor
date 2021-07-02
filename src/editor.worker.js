import * as EditorJS from "./modules/editor.mjs";
import EditorAsmGlue from "./modules/editorasmjs.mjs";
import EditorWasmGlue from "./modules/editorwasm.mjs";

self.addEventListener("message", messageHandler);

var moduleAsmJS = null;
var moduleWasm = null;

function messageHandler(event) {
  if (event.data.option === "init") {
    EditorAsmGlue({
      noInitialRun: true,
      noExitRuntime: true,
    }).then((response) => {
      moduleAsmJS = response;
    });

    EditorWasmGlue({
      noInitialRun: true,
      noExitRuntime: true,
    }).then((response) => {
      moduleWasm = response;
    });

    console.log("Modules initialized!");
    postMessage("ok");
  } else {
    let result = null;
    switch (event.data.tech) {
      case 0:
        result = functionHandlerJS(event);
        console.log(result);
        break;

      case 1:
        result = functionHandlerModule(moduleAsmJS, event);
        break;

      case 2:
        result = functionHandlerModule(moduleWasm, event);
        break;

      default:
        break;
    }
    postMessage(result);
  }
}

function functionHandlerJS(event) {
  const imageData = event.data.imageData;
  const channels = event.data.channels;
  let width = event.data.width;
  let height = event.data.height;
  let length = event.data.length;

  let t0,
    t1,
    output = null,
    outputArray = new Uint8Array(length);

  switch (event.data.option) {
    case "rotate180":
      t0 = performance.now();
      output = EditorJS.rotate180(imageData, length, channels);
      t1 = performance.now();
      break;

    case "rotate90":
      t0 = performance.now();
      output = EditorJS.rotate90(
        imageData,
        outputArray,
        length,
        width,
        height,
        channels
      );
      width = event.data.height;
      height = event.data.width;
      console.log(output.length);
      t1 = performance.now();
      break;

    case "mirror":
      t0 = performance.now();
      output = EditorJS.mirror_reflection(
        imageData,
        length,
        width,
        height,
        channels
      );
      t1 = performance.now();
      break;

    case "invert":
      t0 = performance.now();
      output = EditorJS.invert(imageData, length, channels);
      t1 = performance.now();
      break;

    case "brighten":
      t0 = performance.now();
      output = EditorJS.brighten(
        imageData,
        length,
        event.data.brightnessValue,
        channels
      );
      t1 = performance.now();
      break;

    case "gray":
      t0 = performance.now();
      output = EditorJS.gray_scale(imageData, length, channels);
      t1 = performance.now();
      break;

    case "crop":
      let top = Math.floor(height * 0.1),
        left = Math.floor(width * 0.1),
        nw = Math.floor(width * 0.8),
        nh = Math.floor(height * 0.7);
      outputArray = new Uint8Array(nw * nh * channels);
      t0 = performance.now();
      output = EditorJS.crop(
        imageData,
        outputArray,
        length,
        width,
        height,
        top,
        left,
        nw,
        nh,
        channels
      );
      width = nw;
      height = nh;
      length = nh * nw * channels;
      t1 = performance.now();
      break;

    default:
      break;
  }
  return { imageData: output, width: width, height: height, time: t1 - t0 };
}

function functionHandlerModule(module, event) {
  const imageData = event.data.imageData;
  const channels = event.data.channels;
  let width = event.data.width;
  let height = event.data.height;
  let length = event.data.length;

  let t0 = 0,
    t1 = 0;

  const memory = module._malloc(length);
  module.HEAPU8.set(imageData, memory);

  let outputPointer = memory;
  let memoryOutput = null;

  switch (event.data.option) {
    case "rotate180":
      t0 = performance.now();
      module._rotate180(memory, length, channels);
      t1 = performance.now();
      module._free(memory);
      break;

    case "rotate90":
      t0 = performance.now();
      memoryOutput = module._malloc(length);
      module.HEAPU8.set(props.imageData, memoryOutput);
      module._rotate90(memory, memoryOutput, length, width, height, channels);
      outputPointer = memoryOutput;
      width = event.data.height;
      height = event.data.width;
      t1 = performance.now();

      module._free(memory);
      module._free(memoryOutput);
      break;

    case "mirror":
      t0 = performance.now();
      module._mirror_reflection(memory, length, width, height, channels);
      t1 = performance.now();

      module._free(memory);
      break;

    case "invert":
      t0 = performance.now();
      module._invert(memory, length, channels);
      t1 = performance.now();

      module._free(memory);
      break;

    case "brighten":
      t0 = performance.now();
      module._brighten(memory, length, event.data.brightnessValue, channels);
      t1 = performance.now();

      module._free(memory);
      break;

    case "gray":
      t0 = performance.now();
      module._gray_scale(memory, length, channels);
      t1 = performance.now();

      module._free(memory);
      break;

    case "crop":
      let top = Math.floor(0),
        left = Math.floor(0),
        nw = Math.floor(width * 0.8),
        nh = Math.floor(height * 0.7);
      t0 = performance.now();
      memoryOutput = module._malloc(length);
      module.HEAPU8.set(props.imageData, memoryOutput);
      module._crop(
        memory,
        memoryOutput,
        length,
        width,
        height,
        top,
        left,
        nw,
        nh,
        channels
      );
      outputPointer = memoryOutput;
      width = nw;
      height = nh;
      length = nh * nw * channels;
      t1 = performance.now();

      module._free(memory);
      module._free(memoryOutput);
      break;

    default:
      break;
  }

  const output = module.HEAPU8.subarray(outputPointer, outputPointer + length);

  return {
    imageData: new Uint8Array(output),
    width: width,
    height: height,
    time: t1 - t0,
  };
}
