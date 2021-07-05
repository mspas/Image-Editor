import React, { useState, useEffect, useRef } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";
import Buttons from "./Buttons";
import VideoFile from "../media/video2.mp4";

function Video(props) {
  const videoInput = useRef(null);
  const canvasOutput = useRef(null);
  const [time, setTime] = useState(0);
  const [activeEditor, setActiveEditor] = useState(0);
  const [activeEditorName, setActiveEditorName] = useState("JavaScript");
  const [resolution, setResolution] = useState({ width: 720, height: 480 });
  const [isPaused, setIsPaused] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState("rotate180");

  useEffect(() => {
    if (videoInput.current) startVideo();
  }, []);

  const handleChangeEditor = (option) => {
    let name = "JavaScript";
    switch (option) {
      case 0:
        name = "JavaScript";
        break;
      case 1:
        name = "asm.js";
        break;
      case 2:
        name = "WebAssembly";
        break;
      default:
        break;
    }
    if (!videoInput.current.paused) videoInput.current.pause();
    setActiveEditor(option);
    setActiveEditorName(name);
    videoInput.current.setAttribute("value", option);
  };

  const handleChangeResolution = (width, height) => {
    if (!videoInput.current.paused) videoInput.current.pause();
    setResolution({
      width: width,
      height: height,
    });
    changeCanvasSize(width, height);
    changeVideoSize(width, height);
  };

  const handleChangeFunction = async (option) => {
    if (!videoInput.current.paused) videoInput.current.pause();

    let width = resolution.width,
      height = resolution.height;

    let e = document.getElementById("btnVideo");
    e.setAttribute("value", option);

    setSelectedFunction(option);

    const canvas = canvasOutput.current;
    if (option === "rotate90") {
      canvas.setAttribute("width", height);
      canvas.setAttribute("height", width);
    } else if (option === "crop") {
      let nw = Math.floor(width * 0.8),
        nh = Math.floor(height * 0.7);
      canvas.setAttribute("width", nw);
      canvas.setAttribute("height", nh);
    } else {
      changeCanvasSize(resolution.width, resolution.height);
    }
  };

  const changeCanvasSize = (width, height) => {
    const canvas = canvasOutput.current;
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    setResolution({
      width: width,
      height: height,
    });
  };

  const changeVideoSize = (width, height) => {
    const video = videoInput.current;
    video.setAttribute("width", width);
    video.setAttribute("height", height);
  };

  const hanldeStartVideo = () => {
    if (videoInput.current.paused) {
      videoInput.current.play();
      setIsPaused(false);
    } else {
      videoInput.current.pause();
      setIsPaused(true);
    }
  };

  const startVideo = () => {
    const canvas = canvasOutput.current;
    const channels = 4;

    //canvas.setAttribute("height", resolution.height);
    //canvas.setAttribute("width", resolution.width);

    const context = canvas.getContext("2d");

    videoInput.current.addEventListener("play", () => {
      draw(context, channels, [], []);
    });
  };

  const updateTimer = (context, times, testTimer) => {
    //window.requestAnimationFrame(() => {
    const now = performance.now();
    if (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    let fps = times.length;
    context.font = "40px Arial";
    context.fillText(fps, 10, 40);
    testTimer.push(fps);
    //});
    return { times: times, testTimer: testTimer };
  };

  const draw = (context, channels, times, testTimer) => {
    let width = canvasOutput.current.width;
    let height = canvasOutput.current.height;

    if (!videoInput.current) return false;
    if (videoInput.current.paused) return false;
    let length = height * width * channels;

    let fpsData = updateTimer(context, times, testTimer);

    window.requestAnimationFrame(() => {
      const now = performance.now();
      while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
      }
      times.push(now);
      let fps = times.length;
      context.font = "40px Arial";
      context.fillText(fps, 10, 40);
      testTimer.push(fps);
    });

    context.drawImage(videoInput.current, 0, 0, width, height);
    let frame = context.getImageData(0, 0, width, height);

    let output = processFrame(frame.data, width, height, length, channels);

    if (output.width && output.height) {
      const canvas = canvasOutput.current;
      const selectedFunction = document.getElementById("btnVideo").value;

      let nw = selectedFunction === "rotate90" ? output.height : output.width;
      let nh = selectedFunction === "rotate90" ? output.width : output.height;

      let imageData = context.createImageData(nw, nh);
      imageData.data.set(output.data);
      context.putImageData(imageData, 0, 0);
    } else {
      frame.data.set(output.data);
      context.putImageData(frame, 0, 0);
    }

    setTimeout(
      () => draw(context, channels, fpsData.times, fpsData.testTimer),
      0
    );
  };

  const processFrame = (frameData, width, height, length, channels) => {
    const activeEditor = parseInt(videoInput.current.getAttribute("value"));
    const selectedFunction = document.getElementById("btnVideo").value;
    let output = null;

    if (activeEditor === 0) {
      const moduleJS = props.jsModule;
      switch (selectedFunction) {
        case "rotate180":
          output = rotate180JS(moduleJS, frameData, length, channels);
          break;
        case "rotate90":
          output = rotate90JS(
            moduleJS,
            frameData,
            length,
            width,
            height,
            channels
          );
          break;
        case "mirror":
          output = mirrorJS(
            moduleJS,
            frameData,
            length,
            width,
            height,
            channels
          );
          break;
        case "invert":
          output = invertJS(moduleJS, frameData, length, channels);
          break;
        case "brighten":
          output = brightenJS(moduleJS, frameData, length, 40, channels);
          break;
        case "gray":
          output = grayscaleJS(moduleJS, frameData, length, channels);
          break;
        case "crop":
          console.log(width, height, resolution.width, resolution.height);
          output = cropJS(
            moduleJS,
            frameData,
            length,
            resolution.width,
            resolution.height,
            channels
          );
          break;
        default:
          break;
      }
    } else {
      const module = activeEditor === 1 ? props.asmModule : props.wasmModule;
      switch (selectedFunction) {
        case "rotate180":
          output = rotate180Measure(module, frameData, length, channels);
          break;
        case "rotate90":
          output = rotate90Measure(
            module,
            frameData,
            length,
            width,
            height,
            channels
          );
          break;
        case "mirror":
          output = mirrorMeasure(
            module,
            frameData,
            length,
            width,
            height,
            channels
          );
          break;
        case "invert":
          output = invertMeasure(module, frameData, length, channels);
          break;
        case "brighten":
          output = brightenMeasure(module, frameData, length, 40, channels);
          break;
        case "gray":
          output = grayscaleMeasure(module, frameData, length, channels);
          break;
        case "crop":
          output = cropMeasure(
            module,
            frameData,
            length,
            width,
            height,
            channels
          );
          break;
        default:
          break;
      }
    }
    return output;
  };

  const rotate180JS = (module, imageData, length, channels) => {
    let output;
    output = module.rotate180(imageData, length, channels);
    return { data: output };
  };

  const rotate90JS = (module, imageData, length, width, height, channels) => {
    let output,
      outputArray = new Uint8Array(length);
    output = module.rotate90(
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

    return { data: output, width: width, height: height };
  };

  const mirrorJS = (module, imageData, length, width, height, channels) => {
    let output;
    output = module.mirror_reflection(
      imageData,
      length,
      width,
      height,
      channels
    );
    return { data: output };
  };

  const invertJS = (module, imageData, length, channels) => {
    let output;
    output = module.invert(imageData, length, channels);
    return { data: output };
  };

  const brightenJS = (module, imageData, length, brightnessValue, channels) => {
    let output;
    output = module.brighten(imageData, length, brightnessValue, channels);
    return { data: output };
  };

  const grayscaleJS = (module, imageData, length, channels) => {
    let output;
    output = module.gray_scale(imageData, length, channels);
    return { data: output };
  };

  const cropJS = (module, imageData, length, width, height, channels) => {
    let output;
    let top = Math.floor(height * 0.1),
      left = Math.floor(width * 0.1),
      nw = Math.floor(width * 0.8),
      nh = Math.floor(height * 0.7);
    let outputArray = new Uint8Array(nw * nh * channels);

    output = module.crop(
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

    console.log(output.length);

    return {
      data: output,
      width: width,
      height: height,
      length: length,
    };
  };

  const rotate180Measure = (module, imageData, length, channels) => {
    const memory = module._malloc(length);
    module.HEAPU8.set(imageData, memory);
    module._rotate180(memory, length, channels);

    const output = new Uint8Array(
      module.HEAPU8.subarray(memory, memory + length)
    );

    module._free(memory);
    return { data: output };
  };

  const rotate90Measure = (
    module,
    imageData,
    length,
    width,
    height,
    channels
  ) => {
    let temp = width;

    const memory = module._malloc(length);
    module.HEAPU8.set(imageData, memory);
    const memoryOutput = module._malloc(length);
    module.HEAPU8.set(imageData, memoryOutput);
    module._rotate90(memory, memoryOutput, length, width, height, channels);

    width = height;
    height = temp;

    const output = new Uint8Array(
      module.HEAPU8.subarray(memoryOutput, memoryOutput + length)
    );

    module._free(memory);
    module._free(memoryOutput);
    return { data: output, width: width, height: height };
  };

  const mirrorMeasure = (
    module,
    imageData,
    length,
    width,
    height,
    channels
  ) => {
    const memory = module._malloc(length);
    module.HEAPU8.set(imageData, memory);
    module._mirror_reflection(memory, length, width, height, channels);

    const output = new Uint8Array(
      module.HEAPU8.subarray(memory, memory + length)
    );

    module._free(memory);
    return { data: output };
  };

  const invertMeasure = (module, imageData, length, channels) => {
    const memory = module._malloc(length);
    module.HEAPU8.set(imageData, memory);
    module._invert(memory, length, channels);

    const output = new Uint8Array(
      module.HEAPU8.subarray(memory, memory + length)
    );

    module._free(memory);
    return { data: output };
  };

  const brightenMeasure = (
    module,
    imageData,
    length,
    brightnessValue,
    channels
  ) => {
    const memory = module._malloc(length);
    module.HEAPU8.set(imageData, memory);
    module._brighten(memory, length, brightnessValue, channels);

    const output = new Uint8Array(
      module.HEAPU8.subarray(memory, memory + length)
    );

    module._free(memory);
    return { data: output };
  };

  const grayscaleMeasure = (module, imageData, length, channels) => {
    const memory = module._malloc(length);
    module.HEAPU8.set(imageData, memory);
    module._gray_scale(memory, length, channels);

    const output = new Uint8Array(
      module.HEAPU8.subarray(memory, memory + length)
    );

    module._free(memory);
    return { data: output };
  };

  const cropMeasure = (module, imageData, length, width, height, channels) => {
    let top = Math.floor(height * 0.1),
      left = Math.floor(width * 0.1),
      nw = Math.floor(width * 0.8),
      nh = Math.floor(height * 0.7);

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

    const output = new Uint8Array(
      module.HEAPU8.subarray(memoryOutput, memoryOutput + length)
    );

    module._free(memory);
    module._free(memoryOutput);
    return { data: output, width: width, height: height };
  };

  return (
    <div className={styles.resultBox} id="result">
      <h4>
        {resolution.width}x{resolution.height} {activeEditorName}
      </h4>
      {!props.isLoadingAsmModule && !props.isLoadingWasmModule ? (
        <div>
          <div className={styles.buttonWrap}>
            <button
              className={styles.button}
              onClick={() => handleChangeResolution(720, 480)}
            >
              720x480
            </button>
            <button
              className={styles.button}
              onClick={() => handleChangeResolution(1280, 720)}
            >
              1280x720
            </button>
            <button
              className={styles.button}
              onClick={() => handleChangeResolution(1920, 1080)}
            >
              1920x1080
            </button>
            <button
              className={styles.button}
              onClick={() => handleChangeResolution(3840, 2160)}
            >
              3840x2160
            </button>
          </div>
          <div className={styles.buttonWrap}>
            <button
              className={styles.button}
              onClick={() => handleChangeEditor(0)}
            >
              JS
            </button>
            <button
              className={styles.button}
              onClick={() => handleChangeEditor(1)}
            >
              AsmJS
            </button>
            <button
              className={styles.button}
              onClick={() => handleChangeEditor(2)}
            >
              Wasm
            </button>
          </div>
          <Buttons imageEditHandler={handleChangeFunction} />
          <div className={styles.buttonWrap}>
            <button
              className={styles.button}
              onClick={() => hanldeStartVideo()}
              id="btnVideo"
              value={selectedFunction}
            >
              Start/Stop
            </button>
          </div>
          <canvas ref={canvasOutput} width="720" height="480"></canvas>
          <video
            width="720"
            height="480"
            style={{ visibility: "hidden" }}
            ref={videoInput}
            src={VideoFile}
            type="video/mp4"
            value="0"
            muted
            controls
          ></video>
          {time > 0 ? (
            <div className={styles.alert}>
              Execution of this task took {time} ms.
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      )}
    </div>
  );
}
export default Video;
