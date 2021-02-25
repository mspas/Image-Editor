import React, { useState, useEffect } from "react";
import styles from "./styles/converter.module.sass";
import Loader from "react-loader-spinner";

function ConverterWasm(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [alertText, setAlertText] = useState("Error");
  const [showAlert, setShowAlert] = useState(false);
  const [editedImageData, setEditedImageData] = useState();
  const [instance, setInstance] = useState(null);

  const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
  const heap = new Uint8Array(memory.buffer);
  const importObject = {
    module: {},
    a: {},
    env: {
      memory: memory,
      DYNAMICTOP_PTR: 4096,
      abort: function (err) {
        throw new Error("abort " + err);
      },
      abortOnCannotGrowMemory: function (err) {
        throw new Error("abortOnCannotGrowMemory " + err);
      },
      ___cxa_throw: function (ptr, type, destructor) {
        console.error(
          "cxa_throw: throwing an exception, " + [ptr, type, destructor]
        );
      },
      ___cxa_allocate_exception: function (size) {
        console.error("cxa_allocate_exception" + size);
        return false; // always fail
      },
      ___setErrNo: function (err) {
        throw new Error("ErrNo " + err);
      },
      emscripten_get_heap_size: function () {
        return heap.length;
      },
      emscripten_resize_heap: function (size) {
        return false; // always fail
      },
      emscripten_memcpy_big: function (dest, src, count) {
        heap.set(heap.subarray(src, src + count), dest);
      },
      __table_base: 0,
      table: new WebAssembly.Table({
        initial: 33,
        maximum: 33,
        element: "anyfunc",
      }),
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      let response = undefined;
      if (WebAssembly.instantiateStreaming) {
        response = await WebAssembly.instantiateStreaming(
          fetch("editor.wasm"),
          importObject
        );
      } else {
        const fetchAndInstantiateTask = async () => {
          const wasmArrayBuffer = await fetch("editor.wasm").then((response) =>
            response.arrayBuffer()
          );
          return WebAssembly.instantiate(wasmArrayBuffer, importObject);
        };
        response = await fetchAndInstantiateTask();
      }
      const wasmModule = response;
      setInstance(wasmModule.instance);
      console.log(wasmModule.instance.exports.test3([1, 2, 3, 4, 5, 6]));
    };
    fetchData();
  }, []);

  const imageConvertHandler = async () => {
    if (!props.imageData) return true;

    setIsLoading(true);
  };

  return (
    <div>
      <button className={styles.button} onClick={imageConvertHandler}>
        Convert but wasm
      </button>
      {instance ? instance.exports.doubler(7) : "sram ci na morde"}
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
