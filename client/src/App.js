import React from "react";
import styles from "./App.module.sass";
import Switch from "./components/Switch";
import Converter from "./components/Converter";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      activeOption: 0,
      options: [
        {
          type: "twitch-clip",
          exampleURL: "https://clips.twitch.tv/WonderfulSpikyLlamaWTRuck",
          title: "Share JS-Lib",
        },
        {
          type: "youtube",
          exampleURL: "https://www.youtube.com/watch?v=lU0U3gogyOM",
          title: "Wasm",
        },
      ],
    };
    this.handleOptionClick = this.handleOptionClick.bind(this);
  }

  handleOptionClick(data, index) {
    this.setState(
      {
        activeOption: index,
      },
      () => {
        document.querySelector("html").style.backgroundColor =
          this.state.activeOption === 0 ? "#cfb0ff" : "#ffbdbd";
      }
    );
  }

  render() {
    return (
      <main
        className={
          this.state.activeOption === 0 ? styles.twitch : styles.youtube
        }
      >
        <Switch
          activeOption={this.state.activeOption}
          options={this.state.options}
          onOptionClick={this.handleOptionClick}
        />
        <div className={styles.downloaderWrap}>
          <Converter
            data={this.state.options[this.state.activeOption]}
            key={this.state.options[this.state.activeOption].type}
          />
        </div>
      </main>
    );
  }
}

export default App;
