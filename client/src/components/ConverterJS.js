import React, { useState } from "react";
import styles from "./styles/converter.module.sass";
import Loader from "react-loader-spinner";
import ApiService from "../api.service";

function ConverterJS(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [alertText, setAlertText] = useState("Error");
  const [showAlert, setShowAlert] = useState(false);
  const [editedImageData, setEditedImageData] = useState();

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
      });
  };

  return (
    <div>
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
