import React, { useState } from "react";
import styles from "./styles/converter.module.sass";
import Loader from "react-loader-spinner";

function ConverterJS(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [alertText, setAlertText] = useState("Error");
  const [showAlert, setShowAlert] = useState(false);
  const [editedImageData, setEditedImageData] = useState(null);

  const imageConvertHandler = async () => {
    if (!props.imageData) return true;

    setIsLoading(true);
    window.scrollTo(0, document.body.scrollHeight);

    let rotated = [];
    let length = props.imageData.length;

    for (let i = 0; i < length; i += 4) {
      const r = props.imageData[length - 4 - i];
      const g = props.imageData[length - 3 - i];
      const b = props.imageData[length - 2 - i];
      const a = props.imageData[length - 1 - i];

      rotated.push(r);
      rotated.push(g);
      rotated.push(b);
      rotated.push(a);
    }

    createCanvas(rotated).then(() => {
      props.scrollBottom();
    });
  };

  const createCanvas = (u8a) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = props.imageArraySize.width;
      canvas.height = props.imageArraySize.height;

      var context = canvas.getContext("2d");
      var imageData = context.createImageData(
        props.imageArraySize.width,
        props.imageArraySize.height
      );
      imageData.data.set(u8a);
      context.putImageData(imageData, 0, 0);

      setEditedImageData(canvas.toDataURL());
      setIsLoading(false);

      resolve(true);
    });
  };

  return (
    <div className={styles.resultBox} id="result">
      <button className={styles.button} onClick={imageConvertHandler}>
        Convert
      </button>
      {editedImageData ? <img src={editedImageData} alt="Result" /> : ""}
      {showAlert ? <div className={styles.alert}>{alertText}</div> : ""}
      {isLoading ? (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      ) : (
        ""
      )}
    </div>
  );
}
export default ConverterJS;
