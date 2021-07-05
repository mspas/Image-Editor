import React, { useState, useEffect } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";
import * as EditorJS from "../modules/editor.mjs";
import EditorWasmGlue from "../modules/editorwasm.mjs";
import EditorAsmGlue from "../modules/editorasmjs.mjs";

function BenchmarkOne(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [asmModule, setAsmModule] = useState(null);
  const [wasmModule, setWasmModule] = useState(null);
  const [message, setMessage] = useState("Loading images...");
  const [imagesData, setImagesData] = useState([]);
  const [imagesSizes, setImagesSizes] = useState([]);
  const [imagesCount, setImagesCount] = useState(0);
  const [imagesFoundCount, setImagesFoundCount] = useState(-1);
  const [benchmarkResults, setBenchmarkResults] = useState([]);

  const funcNames = [
    "rotate180",
    "rotate90",
    "mirror",
    "invert",
    "brighten",
    "gray",
    "crop",
  ];
  const techNames = ["JavaScript", "asm.js", "WebAssembly"];

  useEffect(() => {
    EditorWasmGlue({
      noInitialRun: true,
      noExitRuntime: true,
    }).then((response) => {
      setWasmModule(response);
    });

    EditorAsmGlue({
      noInitialRun: true,
      noExitRuntime: true,
    }).then((response) => {
      setAsmModule(response);
    });

    const images = importAll(
      require.context("../media", false, /\.(png|jpe?g|svg)$/)
    );
    setImagesFoundCount(images.length);

    let e = document.getElementById("resultdupa");

    loadImages(e, images);
  }, []);

  useEffect(() => {
    if (imagesCount === imagesFoundCount) {
      setIsLoading(false);
      setMessage(`${imagesCount} images loaded`);
    }
  }, [imagesCount]);

  const importAll = (r) => {
    let images = [];
    r.keys().map((item, index) => {
      let name = item.replace("./", "");
      images.push({ name: name.replace(".jpg", ""), url: r(item) });
    });
    return images;
  };

  const loadImages = (parent, images) => {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < images.length; i++) {
        const img = document.createElement("img");
        img.onload = onImgLoad;
        img.src = images[i].url;
        img.value = images[i].name;
        parent.appendChild(img);
        parent.removeChild(img);
        if (i === images.length - 1) resolve(true);
      }
    });
  };

  const onImgLoad = ({ target: img }) => {
    const res = props.imgToCanvas(img);

    let data = imagesData;
    let sizes = imagesSizes;

    data.push(res.data);
    sizes.push({
      name: img.value ? img.value : "",
      width: res.width,
      height: res.height,
    });

    setImagesData(data);
    setImagesSizes(sizes);
    setImagesCount(data.length);
  };

  const testAllFunctions = async (iterations) => {
    let resultsData = [];

    for (let j = 0; j < imagesData.length; j++) {
      const imageData = imagesData[j];
      const channels = 4;
      let width = imagesSizes[j].width,
        height = imagesSizes[j].height,
        length = imageData.length;

      /*postMessage({
        results: resultsData,
        nextImage: imagesData[j].name,
      });*/

      let resultsImage = [];
      for (let i = 0; i < funcNames.length; i++) {
        let res = await testFunction(
          imageData,
          length,
          width,
          height,
          40,
          channels,
          iterations,
          funcNames[i]
        );
        resultsImage.push(res);
      }
      resultsData.push({ name: imagesSizes[j].name, results: resultsImage });
    }

    return { results: resultsData };
  };

  const testFunction = async (
    imageData1,
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
        imageData = imageData1,
        time = 0;
      for (let i = 0; i < iterations; i++) {
        //console.log("js", JSON.stringify(imageData));
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
        //console.log("js crop po ", JSON.stringify(output.data));
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
            time = rotate180Measure(asmModule, imageData, length, channels);
            break;
          case "rotate90":
            time = rotate90Measure(
              asmModule,
              imageData,
              length,
              width,
              height,
              channels
            );
            break;
          case "mirror":
            time = mirrorMeasure(
              asmModule,
              imageData,
              length,
              width,
              height,
              channels
            );
            break;
          case "invert":
            time = invertMeasure(asmModule, imageData, length, channels);
            break;
          case "brighten":
            time = brightenMeasure(
              asmModule,
              imageData,
              length,
              brightnessValue,
              channels
            );
            break;
          case "gray":
            time = grayscaleMeasure(asmModule, imageData, length, channels);
            break;
          case "crop":
            time = cropMeasure(
              asmModule,
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
            time = rotate180Measure(wasmModule, imageData, length, channels);
            break;
          case "rotate90":
            time = rotate90Measure(
              wasmModule,
              imageData,
              length,
              width,
              height,
              channels
            );
            break;
          case "mirror":
            time = mirrorMeasure(
              wasmModule,
              imageData,
              length,
              width,
              height,
              channels
            );
            break;
          case "invert":
            time = invertMeasure(wasmModule, imageData, length, channels);
            break;
          case "brighten":
            time = brightenMeasure(
              wasmModule,
              imageData,
              length,
              brightnessValue,
              channels
            );
            break;
          case "gray":
            time = grayscaleMeasure(wasmModule, imageData, length, channels);
            break;
          case "crop":
            time = cropMeasure(
              wasmModule,
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

      resolve(results);
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

  const rotate180JS = (imageData, length, channels) => {
    let t0, t1, output;
    t0 = performance.now();
    output = EditorJS.rotate180(imageData, length, channels);
    t1 = performance.now();
    return { data: output, time: t1 - t0 };
  };

  const rotate90JS = (imageData, length, width, height, channels) => {
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
  };

  const mirrorJS = (imageData, length, width, height, channels) => {
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
  };

  const invertJS = (imageData, length, channels) => {
    let t0, t1, output;
    t0 = performance.now();
    output = EditorJS.invert(imageData, length, channels);
    t1 = performance.now();
    return { data: output, time: t1 - t0 };
  };

  const brightenJS = (imageData, length, brightnessValue, channels) => {
    let t0, t1, output;
    t0 = performance.now();
    output = EditorJS.brighten(imageData, length, brightnessValue, channels);
    t1 = performance.now();
    return { data: output, time: t1 - t0 };
  };

  const grayscaleJS = (imageData, length, channels) => {
    let t0, t1, output;
    t0 = performance.now();
    output = EditorJS.gray_scale(imageData, length, channels);
    t1 = performance.now();
    return { data: output, time: t1 - t0 };
  };

  const cropJS = (imageData, length, width, height, channels) => {
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
  };

  const rotate180Measure = (module, imageData, length, channels) => {
    let t0, t1;
    t0 = performance.now();

    const memory = module._malloc(length);
    module.HEAPU8.set(imageData, memory);
    module._rotate180(memory, length, channels);

    t1 = performance.now();
    module._free(memory);
    return t1 - t0;
  };

  const rotate90Measure = (
    module,
    imageData,
    length,
    width,
    height,
    channels
  ) => {
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
  };

  const mirrorMeasure = (
    module,
    imageData,
    length,
    width,
    height,
    channels
  ) => {
    let t0, t1;
    t0 = performance.now();

    const memory = module._malloc(length);
    module.HEAPU8.set(imageData, memory);
    module._mirror_reflection(memory, length, width, height, channels);

    t1 = performance.now();

    module._free(memory);
    return t1 - t0;
  };

  const invertMeasure = (module, imageData, length, channels) => {
    let t0, t1;
    t0 = performance.now();

    const memory = module._malloc(length);
    module.HEAPU8.set(imageData, memory);
    module._invert(memory, length, channels);

    t1 = performance.now();

    module._free(memory);
    return t1 - t0;
  };

  const brightenMeasure = (
    module,
    imageData,
    length,
    brightnessValue,
    channels
  ) => {
    let t0, t1;
    t0 = performance.now();

    const memory = module._malloc(length);
    module.HEAPU8.set(imageData, memory);
    module._brighten(memory, length, brightnessValue, channels);

    t1 = performance.now();

    module._free(memory);
    return t1 - t0;
  };

  const grayscaleMeasure = (module, imageData, length, channels) => {
    let t0, t1;
    t0 = performance.now();

    const memory = module._malloc(length);
    module.HEAPU8.set(imageData, memory);
    module._gray_scale(memory, length, channels);

    t1 = performance.now();

    module._free(memory);
    return t1 - t0;
  };

  const cropMeasure = (module, imageData, length, width, height, channels) => {
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
  };

  const testHandler = async () => {
    const iterations = 10;

    setMessage(`Testing all functions for ${imagesCount} images...`);
    setIsLoading(true);

    let resultsData = await testAllFunctions(iterations);

    setBenchmarkResults(resultsData.results);
    if (resultsData.nextImage) {
      setMessage(`Now testing for ${resultsData.nextImage} image...`);
    } else {
      setIsLoading(false);
      setMessage(`Tests done!`);
    }
  };

  const getResult = (imageResultData, indexTech, funcName) => {
    for (let i = 0; i < imageResultData.results.length; i++) {
      const resSet = imageResultData.results[i];
      for (let j = 0; j < resSet.length; j++) {
        if (resSet[j].tech === indexTech && resSet[j].func === funcName)
          return { time: resSet[j].time, std: resSet[j].std };
      }
    }
  };

  return (
    <div className={styles.resultBox} id="resultdupa">
      {!isLoading && imagesCount === imagesFoundCount ? (
        <button className={styles.button} onClick={testHandler}>
          Test
        </button>
      ) : (
        ""
      )}
      <p>{message}</p>
      {isLoading ? (
        <div>
          <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
        </div>
      ) : (
        ""
      )}
      <p>Results:</p>
      {benchmarkResults.map((image, index) => (
        <table className={styles.tableResults} key={`${image.name}${index}`}>
          <thead>
            <tr>
              <td>{image.name}</td>
              {funcNames.map((func) => (
                <td key={func}>{func}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {techNames.map((tech, index1) => (
              <tr key={`${tech}${index1}`}>
                <td className={styles.techTitle}>{tech}</td>
                {funcNames.map((func) => (
                  <td key={`${tech}${func}`}>
                    <div>
                      <p className={styles.resultTime}>
                        {getResult(image, index1, func).time} ms
                      </p>
                      <span className={styles.resultSTD}>
                        STD = {getResult(image, index1, func).std}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}
export default BenchmarkOne;
