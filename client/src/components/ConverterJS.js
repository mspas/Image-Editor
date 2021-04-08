import React, { useState } from "react";
import styles from "./styles/converter.module.sass";
import Loader from "react-loader-spinner";
import * as EditorModule from "../modules/editor.mjs";

function ConverterJS(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [alertText, setAlertText] = useState("Error");
  const [showAlert, setShowAlert] = useState(false);
  const [editedImageData, setEditedImageData] = useState(null);

  const createCanvas = (u8a, width, height) => {
    const canvas = document.createElement("canvas");
    canvas.height = height;
    canvas.width = width;

    var context = canvas.getContext("2d");
    var imageData = context.createImageData(width, height);
    imageData.data.set(u8a);
    context.putImageData(imageData, 0, 0);

    setEditedImageData(canvas.toDataURL());
    setIsLoading(false);
    window.scrollTo(0, document.body.scrollHeight);
  };

  const imageConvertHandler = async (option) => {
    if (!props.imageData) return true;

    setIsLoading(true);
    window.scrollTo(0, document.body.scrollHeight);

    const channels = 4; //RGBA
    let length = props.imageData.length;
    const imageData = props.imageData;

    let t0 = 0,
      t1 = 0;
    return new Promise((resolve, reject) => {
      let width = props.imageArraySize.width;
      let height = props.imageArraySize.height;
      let output = null;

      switch (option) {
        case "rotate180":
          t0 = performance.now();
          output = EditorModule.rotate180(imageData, length, channels);
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "rotate90":
          t0 = performance.now();
          output = EditorModule.rotate90(
            imageData,
            length,
            width,
            height,
            channels
          );
          width = props.imageArraySize.height;
          height = props.imageArraySize.width;
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "mirror":
          t0 = performance.now();
          output = EditorModule.mirror_reflection(
            imageData,
            length,
            width,
            height,
            channels
          );
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "invert":
          t0 = performance.now();
          output = EditorModule.invert(imageData, length, channels);
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "brighten":
          t0 = performance.now();
          output = EditorModule.brighten(
            imageData,
            length,
            props.brightnessValue,
            channels
          );
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "gray":
          t0 = performance.now();
          output = EditorModule.gray_scale(imageData, length, channels);
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        case "crop":
          let top = 100,
            left = 100,
            nw = 5000,
            nh = 3000;
          t0 = performance.now();
          output = EditorModule.crop(
            imageData,
            length,
            width,
            height,
            top,
            left,
            nw,
            nh,
            channels
          );
          width = nw;
          height = nh;
          length = nh * nw * channels;
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          break;
        default:
          break;
      }

      const resultData = {
        data: output,
        width: width,
        height: height,
      };

      resolve(resultData);
    })
      .then((resultData) => {
        createCanvas(resultData.data, resultData.width, resultData.height);
      })
      .then(() => {
        setIsLoading(false);
        props.scrollBottom();
      });
  };

  return (
    <div className={styles.resultBox} id="result">
      <div className={styles.buttonWrap}>
        <button
          className={styles.button}
          onClick={() => imageConvertHandler("rotate180")}
        >
          Rotate180
        </button>
        <button
          className={styles.button}
          onClick={() => imageConvertHandler("rotate90")}
        >
          Rotate90
        </button>
        <button
          className={styles.button}
          onClick={() => imageConvertHandler("mirror")}
        >
          Mirror
        </button>
        <button
          className={styles.button}
          onClick={() => imageConvertHandler("invert")}
        >
          Invert colors
        </button>
        <button
          className={styles.button}
          onClick={() => imageConvertHandler("brighten")}
        >
          Brighten
        </button>
        <button
          className={styles.button}
          onClick={() => imageConvertHandler("gray")}
        >
          Gray scale
        </button>
        <button
          className={styles.button}
          onClick={() => imageConvertHandler("crop")}
        >
          Crop
        </button>
      </div>
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
