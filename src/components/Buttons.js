import React from "react";
import styles from "./styles/editor.module.sass";

function Buttons(props) {
  return (
    <div className={styles.buttonWrap}>
      <button
        className={styles.button}
        onClick={() => props.imageEditHandler("rotate180")}
      >
        Rotate180
      </button>
      <button
        className={styles.button}
        onClick={() => props.imageEditHandler("rotate90")}
      >
        Rotate90
      </button>
      <button
        className={styles.button}
        onClick={() => props.imageEditHandler("mirror")}
      >
        Mirror
      </button>
      <button
        className={styles.button}
        onClick={() => props.imageEditHandler("invert")}
      >
        Invert colors
      </button>
      <button
        className={styles.button}
        onClick={() => props.imageEditHandler("brighten")}
      >
        Brighten
      </button>
      <button
        className={styles.button}
        onClick={() => props.imageEditHandler("gray")}
      >
        Gray scale
      </button>
      <button
        className={styles.button}
        onClick={() => props.imageEditHandler("crop")}
      >
        Crop
      </button>
    </div>
  );
  /*
      <button
        className={styles.button}
        onClick={() => props.imageEditHandler("test")}
      >
        Test
      </button>*/
}
export default Buttons;
