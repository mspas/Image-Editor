import React, { useState } from "react";
import styles from "./converter.module.sass";
import Loader from "react-loader-spinner";
import ApiService from "../api.service";

function Converter(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [alertText, setAlertText] = useState("Error");
  const [showAlert, setShowAlert] = useState(false);
  const [imageData, setImageData] = useState();
  const [imageDataURL, setImageDataURL] = useState();
  const [editedImageData, setEditedImageData] = useState();
  const [editedImageDataaURL, setEditedImageURL] = useState();

  const _api = new ApiService();

  const prepareImageData = async (fileData, type) => {
    const file = fileData;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      switch (type) {
        case "arraybuffer":
          reader.readAsArrayBuffer(file);
          break;
        case "base64":
          reader.readAsDataURL(file);
          break;
        default:
          reader.readAsArrayBuffer(file);
          break;
      }
    });
  };

  const imageSelectHandler = async (event) => {
    let file = event.target.files[0];
    setImageDataURL(URL.createObjectURL(file));
    let image = await prepareImageData(file, "arraybuffer");
    setImageData(new Uint8Array(image));
  };

  const imagesUploadHandler = async () => {
    if (!imageData) return true;

    setIsLoading(true);
    //window.scrollTo({ top: 0, behavior: "smooth" });

    //console.log(imageData);
    _api
      .fetch("/api/rotate-image", {
        method: "POST",
        body: JSON.stringify({
          imageData: imageData,
          arraySize: imageData.length,
        }),
      })
      .then(async (json) => {
        console.log(json);
        //let blob = new Blob(json.result);
        setEditedImageData(json.result);
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.downloaderContainer}>
      <h1 className={styles.heading}>
        {props.data.title} <span>Converter</span>
      </h1>
      <div className={styles.box}>
        <input
          type="file"
          id="inputfile"
          onChange={(e) => imageSelectHandler(e)}
        />
        <label className={styles.button} htmlFor="inputfile">
          <span>+ Select image...</span>
        </label>
      </div>
      {imageData ? <img src={imageDataURL} alt="Select" /> : "Select image"}
      <button className={styles.button} onClick={imagesUploadHandler}>
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
export default Converter;
