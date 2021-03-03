import React, { useState } from "react";
import styles from "./styles/converter.module.sass";
import Loader from "react-loader-spinner";
import ApiService from "../api.service";

function ConverterShareLib(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [alertText, setAlertText] = useState("Error");
  const [showAlert, setShowAlert] = useState(false);
  const [editedImageData, setEditedImageData] = useState(null);

  const _api = new ApiService();

  const imageConvertHandler = async () => {
    if (!props.imageData) return true;

    setIsLoading(true);

    _api
      .fetch("/api/rotate-image", {
        method: "POST",
        body: JSON.stringify({
          imageData: props.imageData,
          arraySize: props.imageData.length,
        }),
      })
      .then((json) => {
        setEditedImageData(json.result);
        setIsLoading(false);
      })
      .then(() => {
        props.scrollBottom();
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
export default ConverterShareLib;
