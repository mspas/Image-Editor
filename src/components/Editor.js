import React, { useState, useEffect } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";
import Buttons from "./Buttons";

function Editor(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [editedImageData, setEditedImageData] = useState(null);
  const [time, setTime] = useState(0);
  const [outputData, setOutputData] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(
    "Applying filter to the image..."
  );

  useEffect(() => {
    if (props.worker)
      props.worker.onmessage = (event) => {
        if (event.data.imageData) {
          console.log("dupa", event.data.imageData);
          setTime(event.data.time);
          setLoadingMessage("Preparing image preview...");
          setOutputData({
            imageData: event.data.imageData,
            width: event.data.width,
            height: event.data.height,
          });
        }
      };
  }, [props.worker]);

  useEffect(() => {
    if (outputData) {
      let canvas = props.createCanvas(
        outputData.imageData,
        outputData.width,
        outputData.height
      );
      setEditedImageData(canvas);
      setIsLoading(false);

      window.scrollTo(0, document.body.scrollHeight);
      props.scrollBottom();
    }
  }, [outputData]);

  const imageEdit = async (option) => {
    if (!props.imageData) return true;

    setLoadingMessage("Applying filter to the image...");
    setIsLoading(true);

    window.scrollTo(0, document.body.scrollHeight);

    const channels = 4; //RGBA
    let length = props.imageData.length;
    let width = props.imageArraySize.width;
    let height = props.imageArraySize.height;

    props.worker.postMessage({
      tech: props.tech,
      option: option,
      imageData: props.imageData,
      length: length,
      width: width,
      height: height,
      channels: channels,
      brightnessValue: props.brightnessValue,
    });
  };

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
          <p>{loadingMessage}</p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
export default Editor;
