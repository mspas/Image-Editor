import React from "react";
import styles from "./styles/editor.module.sass";

function ImagePicker({ imagesSizes, imagePickerHandler }) {
  return (
    <ul className={styles.picker}>
      {imagesSizes.map((image, index) => (
        <li key={image.width * image.height}>
          <input
            type="checkbox"
            id="scales"
            name="scales"
            defaultChecked={image.selected}
            onChange={() => imagePickerHandler(index, !image.selected)}
          />
          <span>{image.name}</span>
        </li>
      ))}
    </ul>
  );
}
export default ImagePicker;
