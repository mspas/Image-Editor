import React, { useState, useEffect } from "react";
import styles from "./styles/converter.module.sass";
import Loader from "react-loader-spinner";
import EditorGlue from "../editor.mjs";

function ConverterWasm(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModuleLoading, setIsModuleLoading] = useState(false);
  const [alertText, setAlertText] = useState("Error");
  const [showAlert, setShowAlert] = useState(false);
  const [editedImageData, setEditedImageData] = useState();
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

  const imageConvertHandler = async () => {
    if (!props.imageData || !wasmModule) return true;

    setIsLoading(true);

    const channels = 4;
    //const length = props.imageArraySize.height * props.imageArraySize.width * channels;
    const length = props.imageData.length;

    return new Promise((resolve, reject) => {
      const memory = wasmModule._malloc(length); // Allocating WASM memory
      wasmModule.HEAPU8.set(props.imageData, memory); // Copying JS image data to WASM memory
      wasmModule._rotate2(memory, length, channels); // Calling WASM method
      const filteredImageData = wasmModule.HEAPU8.subarray(
        memory,
        memory + length
      );
      resolve(filteredImageData);
    }).then((filteredImageData) => {
      const canvas = document.createElement("canvas");
      canvas.width = props.imageArraySize.width;
      canvas.height = props.imageArraySize.height;

      var context = canvas.getContext("2d");
      var imageData = context.createImageData(
        props.imageArraySize.width,
        props.imageArraySize.height
      );
      imageData.data.set(filteredImageData);
      context.putImageData(imageData, 0, 0);

      setEditedImageData(canvas.toDataURL());
      setIsLoading(false);
    });
  };

  return (
    <div id="resultBox">
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
