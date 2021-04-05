import React, { useState, useEffect } from "react";
import styles from "./styles/converter.module.sass";
import Loader from "react-loader-spinner";
import EditorGlue from "../editor.mjs";

function ConverterWasm(props) {
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

  const createCanvas = (u8a) => {
    const canvas = document.createElement("canvas");
    canvas.height = props.imageArraySize.width; //dumb for rotate90, fix it asap
    canvas.width = props.imageArraySize.height;

    var context = canvas.getContext("2d");
    var imageData = context.createImageData(
      props.imageArraySize.height, //dumb for rotate90, fix it asap
      props.imageArraySize.width
    );
    imageData.data.set(u8a);
    context.putImageData(imageData, 0, 0);

    setEditedImageData(canvas.toDataURL());
    setIsLoading(false);
    window.scrollTo(0, document.body.scrollHeight);
  };

  const imageConvertHandler = async () => {
    if (!props.imageData || !wasmModule) return true;

    setIsLoading(true);
    window.scrollTo(0, document.body.scrollHeight);

    const channels = 4; //RGBA
    const length = props.imageData.length;

    const t0 = performance.now();
    return new Promise((resolve, reject) => {
      console.log(props.imageData);

      const memory = wasmModule._malloc(length); // Allocating WASM memory
      wasmModule.HEAPU8.set(props.imageData, memory); // Copying JS image data to WASM memory
      const memoryfindsiara = wasmModule._malloc(length); // Allocating WASM memory
      wasmModule.HEAPU8.set(props.imageData, memoryfindsiara); // Copying JS image data to WASM memory
      //wasmModule._rotate(memory, length, channels); // Calling WASM method
      wasmModule._rotate90(
        memory,
        memoryfindsiara,
        length,
        props.imageArraySize.width,
        props.imageArraySize.height,
        channels
      ); // Calling WASM method
      const filteredImageData = wasmModule.HEAPU8.subarray(
        memoryfindsiara,
        memoryfindsiara + length
      );
      resolve(filteredImageData);
    })
      .then((filteredImageData) => {
        console.log(filteredImageData);
        const t1 = performance.now();
        console.log(`Call to rotate took ${t1 - t0} milliseconds.`);
        createCanvas(filteredImageData);
      })
      .then(() => {
        props.scrollBottom();
      });
  };

  return (
    <div className={styles.resultBox} id="result">
      {!isModuleLoading ? (
        <button className={styles.button} onClick={imageConvertHandler}>
          Convert but wasm
        </button>
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
export default ConverterWasm;
