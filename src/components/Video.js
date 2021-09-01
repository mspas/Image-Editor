import React, { useState, useEffect, useRef } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";
import OptionSelector from "./OptionSelector";
import VideoProcess from "./VideoProcess";

function Video(props) {
  const videoInput = useRef(null);
  const canvasOutput = useRef(null);
  const [activeEditor, setActiveEditor] = useState(0);
  const [activeEditorName, setActiveEditorName] = useState("JavaScript");
  const [resolution, setResolution] = useState({ width: 720, height: 480 });
  const [selectedFunction, setSelectedFunction] = useState("rotate180");

  const functionList = [
    { name: "rotate180", selected: true },
    { name: "rotate90", selected: false },
    { name: "mirror", selected: false },
    { name: "invert", selected: false },
    { name: "brighten", selected: false },
    { name: "grayscale", selected: false },
    { name: "crop", selected: false },
  ];
  const resolutionList = [
    { name: "720x480", selected: true, width: 720, height: 480 },
    { name: "1280x720", selected: false, width: 1280, height: 720 },
    { name: "1920x1080", selected: false, width: 1920, height: 1080 },
    { name: "3840x2160", selected: false, width: 3840, height: 2160 },
  ];
  const techList = [
    { name: "JavaScript", selected: true },
    { name: "asm.js", selected: false },
    { name: "WebAssembly", selected: false },
  ];

  const handleChangeEditor = (index, value) => {
    let name = techList[index].name;

    if (!videoInput.current.paused) videoInput.current.pause();
    setActiveEditor(index);
    setActiveEditorName(name);
    videoInput.current.setAttribute("value", index);
  };

  const handleChangeResolution = (index, value) => {
    let resolution = resolutionList[index];
    if (!videoInput.current.paused) videoInput.current.pause();
    setResolution({
      width: resolution.width,
      height: resolution.height,
    });
    changeCanvasSize(resolution.width, resolution.height);
    changeVideoSize(resolution.width, resolution.height);
  };

  const handleChangeFunction = (index, value) => {
    let option = functionList[index].name;

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

  return (
    <div className={styles.resultBox} id="result">
      <h4>
        {`${resolution.width}x${resolution.height} ${activeEditorName} - ${selectedFunction}`}
      </h4>
      {!props.isLoadingAsmModule && !props.isLoadingWasmModule ? (
        <div>
          <OptionSelector
            options={resolutionList}
            clickHandler={handleChangeResolution}
            selectorType={"radio"}
          />
          <OptionSelector
            options={techList}
            clickHandler={handleChangeEditor}
            selectorType={"radio"}
          />
          <OptionSelector
            options={functionList}
            clickHandler={handleChangeFunction}
            selectorType={"radio"}
          />
          <VideoProcess
            wasmModule={props.wasmModule}
            asmModule={props.asmModule}
            jsModule={props.jsModule}
            isLoadingAsmModule={props.isLoadingAsmModule}
            isLoadingWasmModule={props.isLoadingWasmModule}
            prepareImageData={props.prepareImageData}
            createCanvas={props.createCanvas}
            imageData={props.imageDataCanvas}
            imageArraySize={props.imageArraySize}
            brightnessValue={props.brightnessValue}
            scrollBottom={props.scrollBottom}
            videoInput={videoInput}
            canvasOutput={canvasOutput}
            selectedFunction={selectedFunction}
            resolution={resolution}
          />
        </div>
      ) : (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      )}
    </div>
  );
}
export default Video;
