import React, { useState } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";
import * as EditorModule from "../modules/editor.mjs";
import Buttons from "./Buttons";

function EditorJS(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [editedImageData, setEditedImageData] = useState(null);
  const [time, setTime] = useState(0);

  const imageEdit = async (option) => {
    if (!props.imageData) return true;

    setIsLoading(true);

    window.scrollTo(0, document.body.scrollHeight);

    const channels = 4; //RGBA
    let length = props.imageData.length;
    let imageData = props.imageData;

    let t0 = 0,
      t1 = 0;
    return new Promise((resolve, reject) => {
      let width = props.imageArraySize.width;
      let height = props.imageArraySize.height;
      let output = null,
        outputArray = new Array(length);

      switch (option) {
        case "rotate180":
          console.log(performance);

          t0 = performance.now();
          output = EditorModule.rotate180(imageData, length, channels);
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          console.log(performance);
          break;
        case "rotate90":
          console.log(performance.memory);
          t0 = performance.now();
          output = EditorModule.rotate90(
            imageData,
            outputArray,
            length,
            width,
            height,
            channels
          );
          width = props.imageArraySize.height;
          height = props.imageArraySize.width;
          t1 = performance.now();
          console.log(`Call to ${option} took ${t1 - t0} milliseconds.`);
          console.log(performance.memory);
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
          let top = Math.floor(height * 0.1),
            left = Math.floor(width * 0.1),
            nw = Math.floor(width * 0.8),
            nh = Math.floor(height * 0.7);
          outputArray = new Array(nw * nh * channels);
          t0 = performance.now();
          output = EditorModule.crop(
            imageData,
            outputArray,
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
        case "test":
          async function load() {
            for (var i = 0; i < 10; i++) {
              output = EditorModule.rotate90(
                imageData,
                imageData,
                length,
                width,
                height,
                channels
              );
              width = props.imageArraySize.height;
              height = props.imageArraySize.width;
              console.log(i);
              await timer(1000); // then the created Promise can be awaited
            }
          }
          load();
          break;
        default:
          break;
      }

      setTime(t1 - t0);

      const resultData = {
        data: output,
        width: width,
        height: height,
      };

      resolve(resultData);
    })
      .then((resultData) => {
        /*let canvas = props.createCanvas(
          resultData.data,
          resultData.width,
          resultData.height
        );
        setEditedImageData(canvas);*/
        setIsLoading(false);
        window.scrollTo(0, document.body.scrollHeight);
      })
      .then(() => {
        props.scrollBottom();
      });
  };

  const timer = (ms) => new Promise((res) => setTimeout(res, ms));

  const imageEditHandler = async (option) => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setTimeout(() => {
        resolve(true);
      }, 100);
    }).then(() => {
      imageEdit(option);
    });
  };

  return (
    <div className={styles.resultBox} id="result">
      <Buttons imageEditHandler={imageEditHandler} />
      {editedImageData ? <img src={editedImageData} alt="Result" /> : ""}
      {time > 0 ? (
        <div className={styles.alert}>
          Execution of this task took {time} ms.
        </div>
      ) : (
        ""
      )}
      {isLoading ? (
        <div>
          <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
          <p>Loading modified image...</p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
export default EditorJS;
