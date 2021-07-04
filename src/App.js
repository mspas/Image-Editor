import React, { useState, useRef } from "react";
import styles from "./App.module.sass";
import Switch from "./components/Switch";
import Home from "./components/Home";

const options = [
  {
    title: "JS",
    color: "#E6DF91",
  },
  {
    title: "asm.js",
    color: "#BBCCFF",
  },
  {
    title: "Wasm",
    color: "#ffbdbd",
  },
  {
    title: "Benchmark",
    color: "#cfb0ff",
  },
  {
    title: "One",
    color: "#cfb0ff",
  },
  {
    title: "Video",
    color: "#cfb0ff",
  },
];

function App() {
  const [activeOption, setActiveOption] = useState(0);
  const mainRef = useRef(null);

  const handleOptionClick = (data, index) => {
    setActiveOption(index);
    mainRef.current.style.backgroundColor = options[index].color;
  };

  return (
    <main ref={mainRef}>
      <Switch
        activeOption={activeOption}
        options={options}
        onOptionClick={handleOptionClick}
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
