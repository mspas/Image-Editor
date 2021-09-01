import React, { useState, useRef } from "react";
import styles from "./App.module.sass";
import Switch from "./components/Switch";
import Home from "./components/Home";

const options = [
  {
    title: "JS",
    subtitle: "Editor",
    color: "#E6DF91",
    description:
      "Upload an image and choose the filter. Output image will be presented with the execution time of selected functionality (excluding the time of preparing the output data to the canvas).",
  },
  {
    title: "asm.js",
    subtitle: "Editor",
    color: "#BBCCFF",
    description:
      "Upload an image and choose the filter. Output image will be presented with the execution time of selected functionality (excluding the time of preparing the output data to the canvas).",
  },
  {
    title: "Wasm",
    subtitle: "Editor",
    color: "#ffbdbd",
    description:
      "Upload an image and choose the filter. Output image will be presented with the execution time of selected functionality (excluding the time of preparing the output data to the canvas).",
  },
  {
    title: "Benchmark",
    subtitle: "Multi-thread",
    color: "#bbffd4",
    description:
      "Choose which exemplary images of given resolutions will be used for experiments. All of the filters repeated 100 times will be part of the tests. Relative gain shows how much using asm.js or WebAssembly is benefitial in case of performance in compare to JavaScript equivalents.",
  },
  /*{
    title: "Benchmark",
    subtitle: "One thread",
    color: "#ffbbf3",
  },*/
  {
    title: "Video",
    subtitle: "Editor",
    color: "#cfb0ff",
    description: `Choose module, resolution and filter, then click "Start". FPS counter will appear in top left corner of processed video.`,
  },
];

function App() {
  const [activeOption, setActiveOption] = useState(0);
  const mainRef = useRef(null);

  const onOptionClick = (data, index) => {
    setActiveOption(index);
    mainRef.current.style.backgroundColor = options[index].color;
  };

  return (
    <main ref={mainRef}>
      <Switch
        activeOption={activeOption}
        options={options}
        onOptionClick={onOptionClick}
      />
      <div className={styles.downloaderWrap}>
        <Home
          activeOption={activeOption}
          data={options[activeOption]}
          key={options[activeOption].type}
        />
      </div>
    </main>
  );
}

export default App;
