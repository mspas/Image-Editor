import React, { useState, useEffect } from "react";
import styles from "./styles/converter.module.sass";
import Loader from "react-loader-spinner";
//import EditorGlue from "../modules/editorwasm.mjs";

function Test(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModuleLoading, setIsModuleLoading] = useState(false);
  const [alertText, setAlertText] = useState("Error");
  const [showAlert, setShowAlert] = useState(false);
  const [editedImageData, setEditedImageData] = useState(null);
  const [wasmModule, setWasmModule] = useState(null);

  var importObject = {
    imports: { imported_func: (arg) => console.log(arg) },
  };
  var memory = new WebAssembly.Memory({ initial: 10, maximum: 100 });

  useEffect(() => {}, []);

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
    const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
    const heap = new Uint8Array(memory.buffer);
    const importObj = {
      env: {
        abortStackOverflow: () => {
          throw new Error("overflow");
        },
        table: new WebAssembly.Table({
          initial: 0,
          maximum: 0,
          element: "anyfunc",
        }),
        tableBase: 0,
        memory: memory,
        memoryBase: 1024,
        STACKTOP: 0,
        STACK_MAX: memory.buffer.byteLength,
      },
    };
    const length = props.imageData.length;
    fetch("editor1.wasm")
      .then((response) => response.arrayBuffer())
      .then((bytes) => WebAssembly.instantiate(bytes, importObj))
      .then((wa) => {
        let d = [1, 2, 3, 4, 5];
        const t0 = performance.now();
        for (let i = 0; i < length; ++i) {
          heap[i] = props.imageData[i];
        }
        wa.instance.exports.rotate180(0, length, 4);

        const result = [];
        for (let i = 0; i < length; ++i) {
          result.push(heap[i]);
        }
        const t1 = performance.now();
        console.log(`Call to took ${t1 - t0} milliseconds.`);
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
export default Test;
