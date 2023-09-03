import React, { useState, useEffect } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";
import VideoFile from "../media/video2.mp4";

function VideoProcess(props) {
  useEffect(() => {
    if (props.videoInput.current) startVideo();
  }, []);

  const hanldeStartVideo = () => {
    if (props.videoInput.current.paused) {
      props.videoInput.current.play();
    } else {
      props.videoInput.current.pause();
    }
  };

  const startVideo = () => {
    const canvas = props.canvasOutput.current;
    const channels = 4;

    //canvas.setAttribute("height", props.resolution.height);
    //canvas.setAttribute("width", props.resolution.width);

    const context = canvas.getContext("2d");

    props.videoInput.current.addEventListener("play", () => {
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
    let width = props.canvasOutput.current.width;
    let height = props.canvasOutput.current.height;

    if (!props.videoInput.current) return false;
    if (props.videoInput.current.paused) return false;
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

    context.drawImage(props.videoInput.current, 0, 0, width, height);
    let frame = context.getImageData(0, 0, width, height);

    let output = processFrame(frame.data, width, height, length, channels);

    if (output.width && output.height) {
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
    const activeEditor = parseInt(
      props.videoInput.current.getAttribute("value")
    );
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
        case "grayscale":
          output = grayscaleJS(moduleJS, frameData, length, channels);
          break;
        case "crop":
          output = cropJS(
            moduleJS,
            frameData,
            length,
            props.resolution.width,
            props.resolution.height,
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
        case "grayscale":
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
    <div>
      {!props.isLoadingAsmModule && !props.isLoadingWasmModule ? (
        <div>
          <div className={styles.buttonWrap}>
            <button
              className={styles.button}
              onClick={() => hanldeStartVideo()}
              id="btnVideo"
              value={props.selectedFunction}
            >
              Start/Stop
            </button>
          </div>
          <canvas ref={props.canvasOutput} width="720" height="480"></canvas>
          <video
            width="720"
            height="480"
            style={{ visibility: "hidden", position: "absolute" }}
            ref={props.videoInput}
            src={VideoFile}
            type="video/mp4"
            value="0"
            muted
            controls
          ></video>
        </div>
      ) : (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      )}
    </div>
  );
}
export default VideoProcess;
