import React, { useState, useEffect } from "react";
import styles from "./styles/editor.module.sass";
import WebWorker from "../editor.worker.js";
//import WebWorkerAsmJs from "../editorasmjs.worker.js";
//import WebWorkerWasm from "../editorwasm.worker.js";
//import WebWorker from "../setup.worker";
import EditorJS from "./EditorJS";
import Editor from "./Editor";
import Test3 from "./Test3";
import Video from "./Video";
import EditorWasmGlue from "../modules/editorwasm.mjs";
import EditorAsmGlue from "../modules/editorasmjs.mjs";
//import EditorWasmGlue from "../modules/editorWasmDyn.mjs";
//import EditorAsmGlue from "../modules/editorAsmjsDyn.mjs";
import * as EditorJSModule from "../modules/editor.mjs";

function Home(props) {
  const [asmModule, setAsmModule] = useState(null);
  const [wasmModule, setWasmModule] = useState(null);
  const [isLoadingAsmModule, setIsLoadingAsmModule] = useState(true);
  const [isLoadingWasmModule, setIsLoadingWasmModule] = useState(true);
  const [imageData, setImageData] = useState();
  const [imageDataCanvas, setImageDataCanvas] = useState();
  const [imageDataURL, setImageDataURL] = useState();
  const [imageArraySize, setImageArraySize] = useState(0);
  const [brightnessValue, setBrightnessValue] = useState(0);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const worker = new WebWorker();
    setWorker(worker);

    EditorWasmGlue({
      noInitialRun: true,
      noExitRuntime: true,
    }).then((response) => {
      setWasmModule(response);
      setIsLoadingWasmModule(false);
    });

    EditorAsmGlue({
      noInitialRun: true,
      noExitRuntime: true,
    }).then((response) => {
      setAsmModule(response);
      setIsLoadingAsmModule(false);
    });
  }, []);

  const prepareImageData2 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(new Uint8Array(event.target.result));
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const prepareImageData = async (fileData, type) => {
    const file = fileData;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      switch (type) {
        case "arraybuffer":
          reader.readAsArrayBuffer(file);
          break;
        case "base64":
          reader.readAsDataURL(file);
          break;
        default:
          reader.readAsArrayBuffer(file);
          break;
      }
    });
  };

  const toCanvas = (source) => {
    if (source instanceof HTMLCanvasElement) {
      return source;
    }
    const canvas = document.createElement("canvas");
    canvas.width = source.videoWidth || source.naturalWidth || source.width;
    canvas.height = source.videoHeight || source.naturalHeight || source.height;
    canvas
      .getContext("2d")
      .drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  const createCanvas = (u8a, width, height) => {
    const canvas = document.createElement("canvas");
    canvas.height = height;
    canvas.width = width;

    var context = canvas.getContext("2d");
    var imageData = context.createImageData(width, height);
    imageData.data.set(u8a);
    context.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
  };

  const onImgLoad = ({ target: img }) => {
    var canvas = toCanvas(img);
    let ctx = canvas.getContext("2d");
    ctx.globalAlpha = 1.0;
    let dataImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setImageDataCanvas(dataImg.data);
    setImageArraySize({ height: dataImg.height, width: dataImg.width });
  };

  const imageSelectHandler = async (event) => {
    let file = event.target.files[0];
    setImageDataURL(URL.createObjectURL(file));

    let imageBuffer = await prepareImageData(file, "arraybuffer");

    let imageBuffer2 = await prepareImageData2(file);

    setImageData(new Uint8Array(imageBuffer));

    scrollBottom();
  };

  const scrollBottom = () => {
    setTimeout(() => {
      let element = document.body;
      element.scrollIntoView({
        alignToTop: false,
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  return (
    <div className={styles.downloaderContainer}>
      <h1 className={styles.heading}>
        {props.data.title} <span>Editor</span>
      </h1>
      {props.activeOption != 4 ? (
        <div className={styles.box}>
          <input
            type="file"
            id="inputfile"
            onChange={(e) => imageSelectHandler(e)}
          />
          <label className={styles.button} htmlFor="inputfile">
            <span>+ Select image...</span>
          </label>
        </div>
      ) : (
        ""
      )}
      {imageData ? (
        <div>
          <img src={imageDataURL} onLoad={onImgLoad} alt="Select" />
          <div className={styles.rangeInput}>
            <p style={{ marginBottom: 5 }}>
              Set brightness (use "Brighten" button to apply):
            </p>
            <input
              className={styles.slider}
              type="range"
              min="-100"
              max="100"
              defaultValue={0}
              onChange={(e) => setBrightnessValue(parseInt(e.target.value))}
            />
            {brightnessValue}
          </div>
        </div>
      ) : (
        ""
      )}
      {props.activeOption === 0 ? (
        <EditorJS
          worker={worker}
          prepareImageData={prepareImageData}
          createCanvas={createCanvas}
          imageData={imageDataCanvas}
          imageArraySize={imageArraySize}
          brightnessValue={brightnessValue}
          scrollBottom={scrollBottom}
        />
      ) : (
        ""
      )}
      {props.activeOption === 1 ? (
        <Editor
          worker={worker}
          module={asmModule}
          isLoadingModule={isLoadingAsmModule}
          prepareImageData={prepareImageData}
          createCanvas={createCanvas}
          imageData={imageDataCanvas}
          imageArraySize={imageArraySize}
          brightnessValue={brightnessValue}
          scrollBottom={scrollBottom}
        />
      ) : (
        ""
      )}
      {props.activeOption === 2 ? (
        <Editor
          worker={worker}
          module={wasmModule}
          isLoadingModule={isLoadingWasmModule}
          prepareImageData={prepareImageData}
          createCanvas={createCanvas}
          imageData={imageDataCanvas}
          imageArraySize={imageArraySize}
          brightnessValue={brightnessValue}
          scrollBottom={scrollBottom}
        />
      ) : (
        ""
      )}
      {props.activeOption === 3 ? (
        <Test3
          wasmModule={wasmModule}
          asmModule={asmModule}
          jsModule={EditorJSModule}
          prepareImageData={prepareImageData}
          createCanvas={createCanvas}
          imageData={imageDataCanvas}
          imageArraySize={imageArraySize}
          brightnessValue={brightnessValue}
          scrollBottom={scrollBottom}
        />
      ) : (
        ""
      )}
      {props.activeOption === 4 ? (
        <Video
          wasmModule={wasmModule}
          asmModule={asmModule}
          jsModule={EditorJSModule}
          isLoadingAsmModule={isLoadingAsmModule}
          isLoadingWasmModule={isLoadingWasmModule}
          prepareImageData={prepareImageData}
          createCanvas={createCanvas}
          imageData={imageDataCanvas}
          imageArraySize={imageArraySize}
          brightnessValue={brightnessValue}
          scrollBottom={scrollBottom}
        />
      ) : (
        ""
      )}
    </div>
  );
}
export default Home;