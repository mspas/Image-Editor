import React, { useState } from "react";
import styles from "./App.module.sass";
import Switch from "./components/Switch";
import Converter from "./components/Converter";

const options = [
  {
    type: "twitch-clip",
    title: "Share JS-Lib",
  },
  {
    type: "youtube",
    title: "Wasm",
  },
];

function App() {
  const [activeOption, setActiveOption] = useState(0);

  const handleOptionClick = (data, index) => {
    setActiveOption(index);
    document.querySelector("html").style.backgroundColor =
      activeOption === 0 ? "#cfb0ff" : "#ffbdbd";
  };

  return (
    <main className={activeOption === 0 ? styles.twitch : styles.youtube}>
      <Switch
        activeOption={activeOption}
        options={options}
        onOptionClick={handleOptionClick}
      />
      <div className={styles.downloaderWrap}>
        <Converter
          activeOption={activeOption}
          data={options[activeOption]}
          key={options[activeOption].type}
        />
      </div>
    </main>
  );
}

export default App;
