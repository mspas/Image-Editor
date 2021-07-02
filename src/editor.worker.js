import * as EditorJS from "./modules/editor.mjs";
import EditorAsmGlue from "./modules/editorasmjs.mjs";
import EditorWasmGlue from "./modules/editorwasm.mjs";

self.addEventListener("message", messageHandler);

function messageHandler(event) {
  if (event.data.option === "init") {
    EditorAsmGlue({
      noInitialRun: true,
      noExitRuntime: true,
    });
    EditorWasmGlue({
      noInitialRun: true,
      noExitRuntime: true,
    });
    postMessage("ok");
  } else {
    let result = null;
    switch (event.data.tech) {
      case 0:
        result = functionHandlerJS(event);
        console.log(result);
        break;

      case 1:
        result = functionHandlerAsmJS(event);
        break;

      case 2:
        result = functionHandlerWasm(event);
        break;

      default:
        break;
    }
    console.log(result);
    postMessage(result);
  }
}

function functionHandlerJS(event) {
  const imageData = event.data.imageData;
  const channels = event.data.channels;
  let width = event.data.width;
  let height = event.data.height;
  let length = event.data.length;

  let output = null,
    outputArray = new Uint8Array(length);

  //t0 = performance.memory.usedJSHeapSize;
  //console.log(performance.memory);
  switch (event.data.option) {
    case "rotate180":
      //t0 = performance.now();
      output = EditorJS.rotate180(imageData, length, channels);
      //t1 = performance.now();
      break;

    case "rotate90":
      //t0 = performance.now();
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
      //t1 = performance.now();
      break;

    case "mirror":
      //t0 = performance.now();
      output = EditorJS.mirror_reflection(
        imageData,
        length,
        width,
        height,
        channels
      );
      //t1 = performance.now();
      break;

    case "invert":
      //t0 = performance.now();
      output = EditorJS.invert(imageData, length, channels);
      //t1 = performance.now();
      //console.log(t1);
      break;

    case "brighten":
      //t0 = performance.now();
      output = EditorJS.brighten(
        imageData,
        length,
        props.brightnessValue,
        channels
      );
      //t1 = performance.now();
      break;

    case "gray":
      //t0 = performance.now();
      output = EditorJS.gray_scale(imageData, length, channels);
      //t1 = performance.now();
      break;

    case "crop":
      let top = Math.floor(height * 0.1),
        left = Math.floor(width * 0.1),
        nw = Math.floor(width * 0.8),
        nh = Math.floor(height * 0.7);
      outputArray = new Uint8Array(nw * nh * channels);
      //t0 = performance.now();
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
      //t1 = performance.now();
      break;

    default:
      break;
  }
  return { imageData: output, width: width, height: height };
}

function functionHandlerAsmJS(event) {}

function functionHandlerWasm(event) {}
