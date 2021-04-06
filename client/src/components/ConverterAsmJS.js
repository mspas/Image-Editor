import React, { useState, useEffect } from "react";
import styles from "./styles/converter.module.sass";
import Loader from "react-loader-spinner";
import EditorGlue from "../editorasm.mjs";

function ConverterAsmJS(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModuleLoading, setIsModuleLoading] = useState(false);
  const [alertText, setAlertText] = useState("Error");
  const [showAlert, setShowAlert] = useState(false);
  const [editedImageData, setEditedImageData] = useState(null);
  const [wasmModule, setWasmModule] = useState(null);

  useEffect(() => {
    setIsModuleLoading(true);
    const mmoduleBuffer = EditorGlue({
      noInitialRun: true,
      noExitRuntime: true,
    }).then((response) => {
      setWasmModule(response);
      setIsModuleLoading(false);
    });
  }, []);

  const createCanvas = (u8a, width, height) => {
    const canvas = document.createElement("canvas");
    canvas.height = height;
    canvas.width = width;

    var context = canvas.getContext("2d");
    var imageData = context.createImageData(width, height);
    imageData.data.set(u8a);
    context.putImageData(imageData, 0, 0);

    setEditedImageData(canvas.toDataURL());
    setIsLoading(false);
    window.scrollTo(0, document.body.scrollHeight);
  };

  const imageConvertHandler = async (option) => {
    if (!props.imageData || !wasmModule) return true;

    setIsLoading(true);
    window.scrollTo(0, document.body.scrollHeight);

    const channels = 4; //RGBA
    const length = props.imageData.length;

    const t0 = performance.now();
    return new Promise((resolve, reject) => {
      const memory = wasmModule._malloc(length);
      wasmModule.HEAPU8.set(props.imageData, memory);

      let width = props.imageArraySize.width;
      let height = props.imageArraySize.height;
      let outputPointer = memory;
      let memoryOutput = null;

      switch (option) {
        case "rotate180":
          wasmModule._rotate180(memory, length, channels);
          break;
        case "rotate90":
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
          break;
        case "mirror":
          wasmModule._mirror_reflection(
            memory,
            length,
            width,
            height,
            channels
          );
          break;
        case "invert":
          wasmModule._invert(memory, length, channels);
          break;
        case "brighten":
          wasmModule._brighten(memory, length, props.brightnessValue, channels);
          break;
        case "gray":
          wasmModule._gray_scale(memory, length, channels);
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
      if (memoryOutput) wasmModule._free(memory);

      resolve(resultData);
    })
      .then((resultData) => {
        const t1 = performance.now();
        console.log(`Call to rotate took ${t1 - t0} milliseconds.`);
        createCanvas(resultData.data, resultData.width, resultData.height);
      })
      .then(() => {
        props.scrollBottom();
      });
  };

  return (
    <div className={styles.resultBox} id="result">
      {!isModuleLoading ? (
        <div className={styles.buttonWrap}>
          <button
            className={styles.button}
            onClick={() => imageConvertHandler("rotate180")}
          >
            Rotate180
          </button>
          <button
            className={styles.button}
            onClick={() => imageConvertHandler("rotate90")}
          >
            Rotate90
          </button>
          <button
            className={styles.button}
            onClick={() => imageConvertHandler("mirror")}
          >
            Mirror
          </button>
          <button
            className={styles.button}
            onClick={() => imageConvertHandler("invert")}
          >
            Invert colors
          </button>
          <button
            className={styles.button}
            onClick={() => imageConvertHandler("brighten")}
          >
            Brighten
          </button>
          <button
            className={styles.button}
            onClick={() => imageConvertHandler("gray")}
          >
            Gray scale
          </button>
        </div>
      ) : (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      )}
      {editedImageData ? <img src={editedImageData} alt="Result" /> : ""}
      {showAlert ? <div className={styles.alert}>{alertText}</div> : ""}
      {isLoading ? (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      ) : (
        ""
      )}
    </div>
  );
}
export default ConverterAsmJS;
