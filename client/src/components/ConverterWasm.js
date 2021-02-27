import React, { useState, useEffect } from "react";
import styles from "./styles/converter.module.sass";
import Loader from "react-loader-spinner";
import worker from "../worker.js";
import WebWorker from "../workerSetup";
import LongerSubSequenceGlue from "../lss.mjs";

function ConverterWasm(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [alertText, setAlertText] = useState("Error");
  const [showAlert, setShowAlert] = useState(false);
  const [editedImageData, setEditedImageData] = useState();
  const [instance, setInstance] = useState(null);

  var worker1;

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
    let module = undefined;
    const mmoduleBuffer = LongerSubSequenceGlue({
      noInitialRun: true,
      noExitRuntime: true,
    }).then((response) => {
      module = response;
      console.log(module);

      let length = 5;
      const memory = module._malloc(length); // Allocating WASM memory
      module.HEAPU8.set([1, 2, 3, 4, 5], memory); // Copying JS image data to WASM memory
      module._test2(memory); // Calling WASM method
      const filteredImageData = module.HEAPU8.subarray(memory, memory + length); // Converting WASM data to JS Image data
      console.log(filteredImageData);
    });

    /*worker1 = new WebWorker(worker);

    let instance = undefined;
    let module = undefined;

    worker1.addEventListener("message", (event) => {
      module = event.data;
      instance = WebAssembly.instantiate(module, importObject);
      console.log(module);

      var result = Module.ccall(
        "test3", // name of C function
        "number", // return type
        ["number"], // argument types
        [5]
      ); // arguments
      console.log(result);
    });

    const fetchData = async () => {
      const fetchAndInstantiateTask = async () => {
        const wasmArrayBuffer = await fetch("editor.wasm")
          .then((response) => response.arrayBuffer())
          .then((bytes) => {
            worker1.postMessage(bytes);
          });
      };
      await fetchAndInstantiateTask();
    };
    fetchData();*/
    /*let instance = undefined;
    let response = undefined;

    const fetchData = async () => {
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
        instance = response.instance;

        const module = Module();

        var result = module.ccall(
          "test3", // name of C function
          "number", // return type
          ["number"], // argument types
          [5]
        ); // arguments
        console.log(result);
      }*/

    /*let instance = undefined;
      let module = undefined;

      const fetchAndInstantiateTask = async () => {
        const wasmArrayBuffer = await fetch("editor.wasm")
          .then((response) => response.arrayBuffer())
          .then((bytes) => {
            module = WebAssembly.Module(bytes);
            instance = WebAssembly.instantiate(module, importObject);
          });
      };
      await fetchAndInstantiateTask();

      let length = 5;

      console.log(module);

      var result = module.ccall(
        "test3", // name of C function
        "number", // return type
        ["number"], // argument types
        [5]
      ); // arguments
      console.log(result);*/

    /*const memory = instance.exports.malloc(length); // Allocating WASM memory
      module.HEAPU8.set([1, 2, 3, 4, 5], memory); // Copying JS image data to WASM memory
      instance.exports.test2(memory); // Calling WASM method
      const filteredImageData = module.HEAPU8.subarray(memory, memory + length); // Converting WASM data to JS Image data
      console.log(filteredImageData);
    };
    fetchData();*/
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
