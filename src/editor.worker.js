import * as EditorJS from "./modules/editor.mjs";
import EditorAsmGlue from "./modules/editorasmjs.mjs";
import EditorWasmGlue from "./modules/editorwasm.mjs";

/* eslint-disable */

self.addEventListener("message", messageHandler);

var moduleAsmJS = null;
var moduleWasm = null;
var funcNames = [
  "rotate180",
  "rotate90",
  "mirror",
  "invert",
  "brighten",
  "gray",
  "crop",
];

async function messageHandler(event) {
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

    console.log("Worker modules initialized!");
    postMessage("ok");
  } else {
    let results = null;
    switch (event.data.tech) {
      case -1:
        results = await testAllFunctions(event);
        break;
      case 0:
        results = funcHandlerJS(event);
        break;

      case 1:
        results = functionHandlerModule(moduleAsmJS, event);
        break;

      case 2:
        results = functionHandlerModule(moduleWasm, event);
        break;

      default:
        break;
    }
    postMessage(results);
  }
}

function funcHandlerJS(event) {
  const imageData = event.data.imageData;
  const channels = event.data.channels;
  let width = event.data.width,
    height = event.data.height,
    length = event.data.length;

  let output = null;

  switch (event.data.option) {
    case "rotate180":
      output = rotate180JS(imageData, length, channels);
      break;
    case "rotate90":
      output = rotate90JS(imageData, length, width, height, channels);
      width = output.width;
      height = output.height;
      break;
    case "mirror":
      output = mirrorJS(imageData, length, width, height, channels);
      break;
    case "invert":
      output = invertJS(imageData, length, channels);
      break;
    case "brighten":
      output = brightenJS(
        imageData,
        length,
        event.data.brightnessValue,
        channels
      );
      break;
    case "gray":
      output = grayscaleJS(imageData, length, channels);
      break;
    case "crop":
      output = cropJS(imageData, length, width, height, channels);
      width = output.width;
      height = output.height;
      length = output.length;
      break;
    default:
      break;
  }

  return {
    imageData: output.data,
    width: width,
    height: height,
    time: output.time,
  };
}

function functionHandlerModule(module, event) {
  const imageData = event.data.imageData;
  const channels = event.data.channels;
  let width = event.data.width;
  let height = event.data.height;
  let length = event.data.length;

  let t0 = 0,
    t1 = 0;

  let memory = null,
    outputPointer = null,
    memoryOutput = null;

  switch (event.data.option) {
    case "rotate180":
      t0 = performance.now();

      memory = module._malloc(length);
      module.HEAPU8.set(imageData, memory);
      outputPointer = memory;
      module._rotate180(memory, length, channels);

      t1 = performance.now();
      module._free(memory);
      break;

    case "rotate90":
      t0 = performance.now();

      memory = module._malloc(length);
      module.HEAPU8.set(imageData, memory);
      outputPointer = memory;
      memoryOutput = module._malloc(length);
      module.HEAPU8.set(imageData, memoryOutput);
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

      memory = module._malloc(length);
      module.HEAPU8.set(imageData, memory);
      outputPointer = memory;
      module._mirror_reflection(memory, length, width, height, channels);

      t1 = performance.now();

      module._free(memory);
      break;

    case "invert":
      t0 = performance.now();

      memory = module._malloc(length);
      module.HEAPU8.set(imageData, memory);
      outputPointer = memory;
      module._invert(memory, length, channels);

      t1 = performance.now();

      module._free(memory);
      break;

    case "brighten":
      t0 = performance.now();

      memory = module._malloc(length);
      module.HEAPU8.set(imageData, memory);
      outputPointer = memory;
      module._brighten(memory, length, event.data.brightnessValue, channels);

      t1 = performance.now();

      module._free(memory);
      break;

    case "gray":
      t0 = performance.now();

      memory = module._malloc(length);
      module.HEAPU8.set(imageData, memory);
      outputPointer = memory;
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

      memory = module._malloc(length);
      module.HEAPU8.set(imageData, memory);
      outputPointer = memory;
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

async function testAllFunctions(event) {
  const imagesData = event.data.imagesData;
  let resultsData = [];

  for (let j = 0; j < imagesData.length; j++) {
    const imageData = imagesData[j].data;
    const channels = event.data.channels;
    let width = imagesData[j].width,
      height = imagesData[j].height,
      length = imagesData[j].length,
      iterations = event.data.iterations;

    postMessage({
      results: resultsData,
      nextImage: imagesData[j].name,
    });

    let resultsImage = [];
    for (let i = 0; i < funcNames.length; i++) {
      let res = await testFunction(
        imageData,
        length,
        width,
        height,
        event.data.brightnessValue,
        channels,
        iterations,
        funcNames[i]
      );
      resultsImage.push(res);
    }
    resultsData.push({ name: imagesData[j].name, results: resultsImage });
  }

  return { results: resultsData };
}

const testFunction = async (
  imageData,
  length,
  width,
  height,
  brightnessValue,
  channels,
  iterations,
  option
) => {
  return new Promise((resolve, reject) => {
    let results = [],
      localResults = [],
      resTemp = null,
      output = null,
      time = 0;
    for (let i = 0; i < iterations; i++) {
      switch (option) {
        case "rotate180":
          output = rotate180JS(imageData, length, channels);
          break;
        case "rotate90":
          output = rotate90JS(imageData, length, width, height, channels);
          break;
        case "mirror":
          output = mirrorJS(imageData, length, width, height, channels);
          break;
        case "invert":
          output = invertJS(imageData, length, channels);
          break;
        case "brighten":
          output = brightenJS(imageData, length, brightnessValue, channels);
          break;
        case "gray":
          output = grayscaleJS(imageData, length, channels);
          break;
        case "crop":
          output = cropJS(imageData, length, width, height, channels);
          break;
        default:
          break;
      }
      localResults.push(output.time);
    }
    resTemp = {
      tech: 0,
      func: option,
      time: Math.round((mean(localResults) + Number.EPSILON) * 100) / 100,
      std:
        Math.round((standardDeviation(localResults) + Number.EPSILON) * 100) /
        100,
    };
    results.push(resTemp);
    localResults = [];

    for (let i = 0; i < iterations; i++) {
      switch (option) {
        case "rotate180":
          time = rotate180Measure(moduleAsmJS, imageData, length, channels);
          break;
        case "rotate90":
          time = rotate90Measure(
            moduleAsmJS,
            imageData,
            length,
            width,
            height,
            channels
          );
          break;
        case "mirror":
          time = mirrorMeasure(
            moduleAsmJS,
            imageData,
            length,
            width,
            height,
            channels
          );
          break;
        case "invert":
          time = invertMeasure(moduleAsmJS, imageData, length, channels);
          break;
        case "brighten":
          time = brightenMeasure(
            moduleAsmJS,
            imageData,
            length,
            brightnessValue,
            channels
          );
          break;
        case "gray":
          time = grayscaleMeasure(moduleAsmJS, imageData, length, channels);
          break;
        case "crop":
          time = cropMeasure(
            moduleAsmJS,
            imageData,
            length,
            width,
            height,
            channels
          );
          break;
        default:
          break;
      }
      localResults.push(time);
    }
    resTemp = {
      tech: 1,
      func: option,
      time: Math.round((mean(localResults) + Number.EPSILON) * 100) / 100,
      std:
        Math.round((standardDeviation(localResults) + Number.EPSILON) * 100) /
        100,
    };
    results.push(resTemp);
    localResults = [];

    for (let i = 0; i < iterations; i++) {
      switch (option) {
        case "rotate180":
          time = rotate180Measure(moduleWasm, imageData, length, channels);
          break;
        case "rotate90":
          time = rotate90Measure(
            moduleWasm,
            imageData,
            length,
            width,
            height,
            channels
          );
          break;
        case "mirror":
          time = mirrorMeasure(
            moduleWasm,
            imageData,
            length,
            width,
            height,
            channels
          );
          break;
        case "invert":
          time = invertMeasure(moduleWasm, imageData, length, channels);
          break;
        case "brighten":
          time = brightenMeasure(
            moduleWasm,
            imageData,
            length,
            brightnessValue,
            channels
          );
          break;
        case "gray":
          time = grayscaleMeasure(moduleWasm, imageData, length, channels);
          break;
        case "crop":
          time = cropMeasure(
            moduleWasm,
            imageData,
            length,
            width,
            height,
            channels
          );
          break;
        default:
          break;
      }
      localResults.push(time);
    }
    resTemp = {
      tech: 2,
      func: option,
      time: Math.round((mean(localResults) + Number.EPSILON) * 100) / 100,
      std:
        Math.round((standardDeviation(localResults) + Number.EPSILON) * 100) /
        100,
    };
    results.push(resTemp);

    return resolve(results);
  });
};

function mean(array) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i];
  }
  return sum / array.length;
}

function standardDeviation(array) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );
}

function rotate180JS(imageData, length, channels) {
  let t0, t1, output;
  t0 = performance.now();
  output = EditorJS.rotate180(imageData, length, channels);
  t1 = performance.now();
  return { data: output, time: t1 - t0 };
}

function rotate90JS(imageData, length, width, height, channels) {
  let t0,
    t1,
    output,
    outputArray = new Uint8Array(length);
  t0 = performance.now();
  output = EditorJS.rotate90(
    imageData,
    outputArray,
    length,
    width,
    height,
    channels
  );
  let temp = width;
  width = height;
  height = temp;

  t1 = performance.now();
  return { data: output, time: t1 - t0, width: width, height: height };
}

function mirrorJS(imageData, length, width, height, channels) {
  let t0, t1, output;
  t0 = performance.now();
  output = EditorJS.mirror_reflection(
    imageData,
    length,
    width,
    height,
    channels
  );
  t1 = performance.now();
  return { data: output, time: t1 - t0 };
}

function invertJS(imageData, length, channels) {
  let t0, t1, output;
  t0 = performance.now();
  output = EditorJS.invert(imageData, length, channels);
  t1 = performance.now();
  return { data: output, time: t1 - t0 };
}

function brightenJS(imageData, length, brightnessValue, channels) {
  let t0, t1, output;
  t0 = performance.now();
  output = EditorJS.brighten(imageData, length, brightnessValue, channels);
  t1 = performance.now();
  return { data: output, time: t1 - t0 };
}

function grayscaleJS(imageData, length, channels) {
  let t0, t1, output;
  t0 = performance.now();
  output = EditorJS.gray_scale(imageData, length, channels);
  t1 = performance.now();
  return { data: output, time: t1 - t0 };
}

function cropJS(imageData, length, width, height, channels) {
  let t0, t1, output;
  let top = Math.floor(height * 0.1),
    left = Math.floor(width * 0.1),
    nw = Math.floor(width * 0.8),
    nh = Math.floor(height * 0.7);
  let outputArray = new Uint8Array(nw * nh * channels);

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
  return {
    data: output,
    time: t1 - t0,
    width: width,
    height: height,
    length: length,
  };
}

function rotate180Measure(module, imageData, length, channels) {
  let t0, t1;
  t0 = performance.now();

  const memory = module._malloc(length);
  module.HEAPU8.set(imageData, memory);
  module._rotate180(memory, length, channels);

  t1 = performance.now();
  module._free(memory);
  return t1 - t0;
}

function rotate90Measure(module, imageData, length, width, height, channels) {
  let t0,
    t1,
    temp = width;

  t0 = performance.now();

  const memory = module._malloc(length);
  module.HEAPU8.set(imageData, memory);
  const memoryOutput = module._malloc(length);
  module.HEAPU8.set(imageData, memoryOutput);
  module._rotate90(memory, memoryOutput, length, width, height, channels);

  width = height;
  height = temp;
  t1 = performance.now();

  module._free(memory);
  module._free(memoryOutput);
  return t1 - t0;
}

function mirrorMeasure(module, imageData, length, width, height, channels) {
  let t0, t1;
  t0 = performance.now();

  const memory = module._malloc(length);
  module.HEAPU8.set(imageData, memory);
  module._mirror_reflection(memory, length, width, height, channels);

  t1 = performance.now();

  module._free(memory);
  return t1 - t0;
}

function invertMeasure(module, imageData, length, channels) {
  let t0, t1;
  t0 = performance.now();

  const memory = module._malloc(length);
  module.HEAPU8.set(imageData, memory);
  module._invert(memory, length, channels);

  t1 = performance.now();

  module._free(memory);
  return t1 - t0;
}

function brightenMeasure(module, imageData, length, brightnessValue, channels) {
  let t0, t1;
  t0 = performance.now();

  const memory = module._malloc(length);
  module.HEAPU8.set(imageData, memory);
  module._brighten(memory, length, brightnessValue, channels);

  t1 = performance.now();

  module._free(memory);
  return t1 - t0;
}

function grayscaleMeasure(module, imageData, length, channels) {
  let t0, t1;
  t0 = performance.now();

  const memory = module._malloc(length);
  module.HEAPU8.set(imageData, memory);
  module._gray_scale(memory, length, channels);

  t1 = performance.now();

  module._free(memory);
  return t1 - t0;
}

function cropMeasure(module, imageData, length, width, height, channels) {
  let t0, t1;
  let top = Math.floor(height * 0.1),
    left = Math.floor(width * 0.1),
    nw = Math.floor(width * 0.8),
    nh = Math.floor(height * 0.7);

  t0 = performance.now();

  const memory = module._malloc(length);
  module.HEAPU8.set(imageData, memory);
  const memoryOutput = module._malloc(length);
  module.HEAPU8.set(imageData, memoryOutput);
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
  width = nw;
  height = nh;
  length = nh * nw * channels;

  t1 = performance.now();

  module._free(memory);
  module._free(memoryOutput);
  return t1 - t0;
}
