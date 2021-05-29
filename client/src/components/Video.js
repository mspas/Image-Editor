import React, { useState, useEffect, useRef } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";
import VideoFile from "../media/video.mp4";

function Video(props) {
  const videoInput = useRef(null);
  const canvasOutput = useRef(null);
  const [time, setTime] = useState(0);
  const [activeEditor, setActiveEditor] = useState(0);
  const [activeEditorName, setActiveEditorName] = useState("JavaScript");
  const [resolution, setResolution] = useState({ width: 720, height: 480 });
  const [isPaused, setIsPaused] = useState(false);

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

  const changeCanvasSize = (width, height) => {
    const canvas = canvasOutput.current;
    canvas.setAttribute("height", height);
    canvas.setAttribute("width", width);
  };

  const changeVideoSize = (width, height) => {
    const video = videoInput.current;
    video.setAttribute("height", height);
    video.setAttribute("width", width);
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

    canvas.setAttribute("height", resolution.height);
    canvas.setAttribute("width", resolution.width);

    const context = canvas.getContext("2d");

    videoInput.current.addEventListener("play", () => {
      draw(context, channels, []);
    });
  };

  const draw = (context, channels, times) => {
    let width = canvasOutput.current.width;
    let height = canvasOutput.current.height;

    console.log(width, height);

    if (!videoInput.current) return false;
    if (videoInput.current.paused) return false;
    let length = height * width * channels;

    window.requestAnimationFrame(() => {
      const now = performance.now();
      while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
      }
      times.push(now);
      let fps = times.length;
      context.font = "40px Arial";
      context.fillText(fps, 10, 40);
    });

    context.drawImage(videoInput.current, 0, 0, width, height);
    let frame = context.getImageData(0, 0, width, height);

    let output = processFrame(frame.data, length, channels);
    frame.data.set(output);

    context.putImageData(frame, 0, 0);
    setTimeout(() => draw(context, channels, times), 0);
  };

  const processFrame = (frameData, length, channels) => {
    const activeEditor = parseInt(videoInput.current.getAttribute("value"));
    //console.log(activeEditor);
    if (activeEditor === 0) {
      const module = props.jsModule;
      return module.gray_scale(frameData, length, channels);
      //return module.brighten(frameData, length, 20, channels);
    } else {
      const module = activeEditor === 1 ? props.asmModule : props.wasmModule;
      const memory = module._malloc(length);
      module.HEAPU8.set(frameData, memory);
      //module._brighten(memory, length, 20, channels);
      module._gray_scale(memory, length, channels);
      let frameOutputData = module.HEAPU8.subarray(memory, memory + length);
      module._free(memory);
      return frameOutputData;
    }
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
          <div className={styles.buttonWrap}>
            <button
              className={styles.button}
              onClick={() => hanldeStartVideo()}
            >
              Start/Stop
            </button>
          </div>
          <canvas ref={canvasOutput} width="720" height="405"></canvas>
          <video
            width="720"
            height="405"
            autoPlay
            ref={videoInput}
            loop={true}
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
