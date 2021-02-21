import React from "react";
import styles from "./switch.module.sass";

class Switch extends React.Component {
  render() {
    let options = this.props.options.map((data, index) => {
      return (
        <div
          className={
            this.props.activeOption === index
              ? `${styles.switchOption} ${styles.active}`
              : styles.switchOption
          }
          key={index}
          onClick={this.props.onOptionClick.bind(null, data, index)}
        >
          <div className={styles.switchOptionContent}>
            <span className={styles.title}>{data.title}</span>
            <span className={styles.titleSm}>Converter</span>
          </div>
        </div>
      );
    });
    return <div className={styles.switchContainer}>{options}</div>;
  }
}
export default Switch;
