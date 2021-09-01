import React from "react";
import styles from "./styles/selector.module.sass";

function OptionSelector({ options, clickHandler, selectorType }) {
  return (
    <form className={styles.selector}>
      {options.map((option, index) => (
        <div className={styles.option} key={index * Math.PI}>
          <input
            type={selectorType}
            id="scales"
            name="scales"
            defaultChecked={option.selected}
            onChange={() => clickHandler(index, !option.selected)}
          />
          <span>{option.name}</span>
        </div>
      ))}
    </form>
  );
}
export default OptionSelector;
