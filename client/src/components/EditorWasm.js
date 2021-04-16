import React, { useState, useEffect } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";
import EditorGlue from "../modules/editorwasm.mjs";
import Buttons from "./Buttons";

function EditorWasm(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModuleLoading, setIsModuleLoading] = useState(false);
  const [editedImageData, setEditedImageData] = useState(null);
  const [wasmModule, setWasmModule] = useState(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setIsModuleLoading(true);
    EditorGlue({
      noInitialRun: true,
      noExitRuntime: true,
    }).then((response) => {
      setWasmModule(response);
      setIsModuleLoading(false);
    });
  }, []);

  const imageEdit = async (option) => {
    if (!props.imageData || !wasmModule) return true;

    setIsLoading(true);
    window.scrollTo(0, document.body.scrollHeight);

    const channels = 4; //RGBA
    let length = props.imageData.length;

    let t0 = 0,
      t1 = 0;
    return new Promise((resolve, reject) => {
      const memory = wasmModule._malloc(length);
      wasmModule.HEAPU8.set(props.imageData, memory);

      let width = props.imageArraySize.width;
      let height = props.imageArraySize.height;
      let outputPointer = memory;
      let memoryOutput = null;

      switch (option) {
        case "rotate180":
          t0 = performance.now();
          wasmModule._rotate180(memory, length, channels);
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "rotate90":
          t0 = performance.now();
          memoryOutput = wasmModule._malloc(length);
          wasmModule.HEAPU8.set(props.imageData, memoryOutput);
          wasmModule._rotate90(
            memory,
            memoryOutput,
            length,
            width,
            height,
            channels
          );
          outputPointer = memoryOutput;
          width = props.imageArraySize.height;
          height = props.imageArraySize.width;
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "mirror":
          t0 = performance.now();
          wasmModule._mirror_reflection(
            memory,
            length,
            width,
            height,
            channels
          );
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "invert":
          t0 = performance.now();
          wasmModule._invert(memory, length, channels);
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "brighten":
          t0 = performance.now();
          wasmModule._brighten(memory, length, props.brightnessValue, channels);
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "gray":
          t0 = performance.now();
          wasmModule._gray_scale(memory, length, channels);
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "crop":
          let top = Math.floor(height * 0.1),
            left = Math.floor(width * 0.1),
            nw = Math.floor(width * 0.8),
            nh = Math.floor(height * 0.7);
          t0 = performance.now();
          memoryOutput = wasmModule._malloc(length);
          wasmModule.HEAPU8.set(props.imageData, memoryOutput);
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
          outputPointer = memoryOutput;
          width = nw;
          height = nh;
          length = nh * nw * channels;
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        default:
          break;
      }

      const editedImage = wasmModule.HEAPU8.subarray(
        outputPointer,
        outputPointer + length
      );

      const resultData = {
        data: editedImage,
        width: width,
        height: height,
      };

      wasmModule._free(memory);
      if (memoryOutput) wasmModule._free(memoryOutput);

      setTime(t1 - t0);
      resolve(resultData);
    })
      .then((resultData) => {
        let canvas = props.createCanvas(
          resultData.data,
          resultData.width,
          resultData.height
        );
        setEditedImageData(canvas);
        setIsLoading(false);
        window.scrollTo(0, document.body.scrollHeight);
      })
      .then(() => {
        props.scrollBottom();
      });
  };

  const imageEditHandler = async (option) => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setTimeout(() => {
        resolve(true);
      }, 100);
    }).then(() => {
      imageEdit(option);
    });
  };

  return (
    <div className={styles.resultBox} id="result">
      {!isModuleLoading ? (
        <Buttons imageEditHandler={imageEditHandler} />
      ) : (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      )}
      {editedImageData ? <img src={editedImageData} alt="Result" /> : ""}
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
export default EditorWasm;
