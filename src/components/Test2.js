import React, { useState, useEffect } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";
import * as EditorJSModule from "../modules/editor.mjs";
import EditorWasmGlue from "../modules/editorwasm.mjs";
import EditorAsmGlue from "../modules/editorasmjs.mjs";

function Test2(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [asmModule, setAsmModule] = useState(null);
  const [wasmModule, setWasmModule] = useState(null);

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
  }, []);

  const mean = (array) => {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum / array.length;
  };

  const standardDeviation = (array) => {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(
      array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
    );
  };

  const testRotate90 = async (iterations) => {
    return new Promise((resolve, reject) => {
      let t0,
        t1,
        memoryOutput,
        results = [];
      let length = props.imageData.length,
        imageData = props.imageData;
      let width = props.imageArraySize.width,
        height = props.imageArraySize.height;
      let outputArray = new Array(length);
      const channels = 4;

      console.log("------------------------------");

      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();
        EditorJSModule.rotate90(
          imageData,
          outputArray,
          length,
          width,
          height,
          channels
        );
        t1 = performance.now();
        results.push(t1 - t0);
        //console.log(i, t1 - t0);
      }
      console.log(`Avarage JS rotate90 in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = asmModule._malloc(length);
        asmModule.HEAPU8.set(imageData, memory);

        memoryOutput = asmModule._malloc(length);
        asmModule.HEAPU8.set(imageData, memoryOutput);

        asmModule._rotate90(
          memory,
          memoryOutput,
          length,
          width,
          height,
          channels
        );

        t1 = performance.now();
        results.push(t1 - t0);
        asmModule._free(memory);
        asmModule._free(memoryOutput);
        //console.log(i, t1 - t0);
      }
      console.log(`Avarage AsmJS rotate90 in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = wasmModule._malloc(length);
        wasmModule.HEAPU8.set(imageData, memory);

        memoryOutput = wasmModule._malloc(length);
        wasmModule.HEAPU8.set(imageData, memoryOutput);

        wasmModule._rotate90(
          memory,
          memoryOutput,
          length,
          width,
          height,
          channels
        );

        t1 = performance.now();
        results.push(t1 - t0);
        wasmModule._free(memory);
        wasmModule._free(memoryOutput);
        //console.log(i, t1 - t0);
      }
      console.log(`Avarage Wasm rotate90 in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);
      resolve(true);
    });
  };

  const testRotate180 = async (iterations) => {
    return new Promise((resolve, reject) => {
      let t0,
        t1,
        results = [];
      let length = props.imageData.length,
        imageData = props.imageData;
      const channels = 4;

      console.log("------------------------------");

      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();
        EditorJSModule.rotate180(imageData, length, channels);
        t1 = performance.now();
        results.push(t1 - t0);
        //console.log(t1 - t0);
      }
      console.log(`Avarage JS rotate180 in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = asmModule._malloc(length);
        asmModule.HEAPU8.set(imageData, memory);

        asmModule._rotate180(memory, length, channels);

        t1 = performance.now();
        results.push(t1 - t0);
        asmModule._free(memory);
        //console.log(t1 - t0);
      }
      console.log(
        `Avarage AsmJS rotate180 in ${iterations} = ${mean(results)}`
      );
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = wasmModule._malloc(length);
        wasmModule.HEAPU8.set(imageData, memory);

        wasmModule._rotate180(memory, length, channels);

        t1 = performance.now();
        results.push(t1 - t0);
        wasmModule._free(memory);
        //console.log(t1 - t0);
      }
      console.log(`Avarage Wasm rotate180 in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);
      resolve(true);
    });
  };

  const testMirror = async (iterations) => {
    return new Promise((resolve, reject) => {
      let t0,
        t1,
        results = [];
      let imageData = props.imageData,
        length = props.imageData.length;
      let width = props.imageArraySize.width,
        height = props.imageArraySize.height;
      const channels = 4;

      console.log("------------------------------");

      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();
        EditorJSModule.mirror_reflection(
          imageData,
          length,
          width,
          height,
          channels
        );
        t1 = performance.now();
        results.push(t1 - t0);
      }
      console.log(`Avarage JS mirror in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = asmModule._malloc(length);
        asmModule.HEAPU8.set(imageData, memory);

        asmModule._rotate180(memory, length, channels);

        t1 = performance.now();
        results.push(t1 - t0);
        asmModule._free(memory);
      }
      console.log(`Avarage AsmJS mirror in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = wasmModule._malloc(length);
        wasmModule.HEAPU8.set(imageData, memory);

        wasmModule._rotate180(memory, length, channels);

        t1 = performance.now();
        results.push(t1 - t0);
        wasmModule._free(memory);
      }
      console.log(`Avarage Wasm mirror in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);
      resolve(true);
    });
  };

  const testInvert = async (iterations) => {
    return new Promise((resolve, reject) => {
      let t0,
        t1,
        results = [];
      let imageData = props.imageData,
        length = props.imageData.length;
      const channels = 4;

      console.log("------------------------------");

      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();
        EditorJSModule.invert(imageData, length, channels);
        t1 = performance.now();
        results.push(t1 - t0);
      }
      console.log(`Avarage JS invert in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = asmModule._malloc(length);
        asmModule.HEAPU8.set(imageData, memory);

        asmModule._invert(memory, length, channels);

        t1 = performance.now();
        results.push(t1 - t0);
        asmModule._free(memory);
      }
      console.log(`Avarage AsmJS invert in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = wasmModule._malloc(length);
        wasmModule.HEAPU8.set(imageData, memory);

        wasmModule._invert(memory, length, channels);

        t1 = performance.now();
        results.push(t1 - t0);
        wasmModule._free(memory);
      }
      console.log(`Avarage Wasm invert in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);
      resolve(true);
    });
  };

  const testBrighten = async (iterations) => {
    return new Promise((resolve, reject) => {
      let t0,
        t1,
        results = [];
      let imageData = props.imageData,
        length = props.imageData.length;
      const channels = 4;

      console.log("------------------------------");

      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();
        EditorJSModule.brighten(imageData, length, 50, channels);
        t1 = performance.now();
        results.push(t1 - t0);
      }
      console.log(`Avarage JS brighten in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = asmModule._malloc(length);
        asmModule.HEAPU8.set(imageData, memory);

        asmModule._brighten(memory, length, 50, channels);

        t1 = performance.now();
        results.push(t1 - t0);
        asmModule._free(memory);
      }
      console.log(`Avarage AsmJS brighten in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = wasmModule._malloc(length);
        wasmModule.HEAPU8.set(imageData, memory);

        wasmModule._brighten(memory, length, 50, channels);

        t1 = performance.now();
        results.push(t1 - t0);
        wasmModule._free(memory);
      }
      console.log(`Avarage Wasm brighten in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);
      resolve(true);
    });
  };

  const testGrey = async (iterations) => {
    return new Promise((resolve, reject) => {
      let t0,
        t1,
        results = [];
      let imageData = props.imageData,
        length = props.imageData.length;
      const channels = 4;

      console.log("------------------------------");

      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();
        EditorJSModule.gray_scale(imageData, length, channels);
        t1 = performance.now();
        results.push(t1 - t0);
      }
      console.log(`Avarage JS grey in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = asmModule._malloc(length);
        asmModule.HEAPU8.set(imageData, memory);

        asmModule._gray_scale(memory, length, channels);

        t1 = performance.now();
        results.push(t1 - t0);
        asmModule._free(memory);
      }
      console.log(`Avarage AsmJS grey in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = wasmModule._malloc(length);
        wasmModule.HEAPU8.set(imageData, memory);

        wasmModule._gray_scale(memory, length, channels);

        t1 = performance.now();
        results.push(t1 - t0);
        wasmModule._free(memory);
      }
      console.log(`Avarage Wasm grey in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);
      resolve(true);
    });
  };

  const testCrop = async (iterations) => {
    return new Promise((resolve, reject) => {
      let t0,
        t1,
        memoryOutput,
        results = [];
      let length = props.imageData.length,
        imageData = props.imageData;
      let width = props.imageArraySize.width,
        height = props.imageArraySize.height;
      const channels = 4;

      let top = Math.floor(height * 0.1),
        left = Math.floor(width * 0.1),
        nw = Math.floor(width * 0.8),
        nh = Math.floor(height * 0.7);

      let outputArray = new Array(nw * nh * channels);
      console.log("------------------------------");

      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();
        EditorJSModule.crop(
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
        t1 = performance.now();
        results.push(t1 - t0);
        //console.log(i, t1 - t0);
      }
      //localStorage.setItem("js", results);
      console.log(`Avarage JS crop in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = asmModule._malloc(length);
        asmModule.HEAPU8.set(imageData, memory);
        memoryOutput = asmModule._malloc(length);
        asmModule.HEAPU8.set([], memoryOutput);

        asmModule._crop(
          memory,
          memoryOutput,
          length,
          height,
          width,
          top,
          left,
          nw,
          nh,
          channels
        );

        t1 = performance.now();

        asmModule._free(memory);
        asmModule._free(memoryOutput);
        results.push(t1 - t0);
        //console.log(i, t1 - t0);
      }
      //localStorage.setItem("asm", results);
      console.log(`Avarage AsmJS crop in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);

      results = [];
      for (let i = 0; i < iterations; i++) {
        t0 = performance.now();

        const memory = wasmModule._malloc(length);
        wasmModule.HEAPU8.set(imageData, memory);

        memoryOutput = wasmModule._malloc(length);
        wasmModule.HEAPU8.set([], memoryOutput);

        wasmModule._crop(
          memory,
          memoryOutput,
          length,
          height,
          width,
          top,
          left,
          nw,
          nh,
          channels
        );

        t1 = performance.now();

        wasmModule._free(memory);
        wasmModule._free(memoryOutput);
        results.push(t1 - t0);
        //console.log(i, t1 - t0);
      }
      //localStorage.setItem("wasm", results);
      console.log(`Avarage Wasm crop in ${iterations} = ${mean(results)}`);
      console.log(`STD = ${standardDeviation(results)}`);
      resolve(true);
    });
  };

  const testHandler = async () => {
    if (!props.imageData) {
      alert("image ffs!");
      return;
    }

    const iterations = 100;

    setIsLoading(true);

    await testRotate180(iterations);
    await testRotate90(iterations);
    await testInvert(iterations);
    await testGrey(iterations);
    await testMirror(iterations);
    await testBrighten(iterations);
    await testCrop(iterations);

    setIsLoading(false);
  };

  return (
    <div className={styles.resultBox} id="result">
      <button className={styles.button} onClick={testHandler}>
        Test2
      </button>
      {time > 0 ? (
        <div className={styles.alert}>
          Execution of this task took {time} ms.
        </div>
      ) : (
        ""
      )}
      {isLoading ? (
        <div>
          <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
          <p>Loading modified image...</p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
export default Test2;
