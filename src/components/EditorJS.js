import React, { useState, useEffect } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";
import * as EditorModule from "../modules/editor.mjs";
import Buttons from "./Buttons";

function EditorJS(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [editedImageData, setEditedImageData] = useState(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (props.worker)
      props.worker.onmessage = (event) => {
        console.log(event);
        /*let canvas = props.createCanvas(
          event.data.imageData,
          event.data.width,
          event.data.height
        );
        setEditedImageData(canvas);*/
        setIsLoading(false);
        window.scrollTo(0, document.body.scrollHeight);
        props.scrollBottom();
      };
  }, [props.worker]);

  const imageEdit = async (option) => {
    if (!props.imageData) return true;

    setIsLoading(true);

    window.scrollTo(0, document.body.scrollHeight);

    const channels = 4; //RGBA
    let length = props.imageData.length;
    let width = props.imageArraySize.width;
    let height = props.imageArraySize.height;

    props.worker.postMessage({
      tech: 0,
      option: option,
      imageData: props.imageData,
      length: length,
      width: width,
      height: height,
      channels: channels,
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
