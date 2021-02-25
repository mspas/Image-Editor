import React, { useState } from "react";
import styles from "./styles/converter.module.sass";
import ConverterJS from "./ConverterJS";
import ConverterWasm from "./ConverterWasm";

function Converter(props) {
  const [imageData, setImageData] = useState();
  const [imageDataURL, setImageDataURL] = useState();
  const [imageArraySize, setImageArraySize] = useState(0);
  const channels = 3;

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

    let img = new Image();
    var objectUrl = URL.createObjectURL(file);
    setImageDataURL(objectUrl);

    img.onload = () => {
      //setImageArraySize(this.width * this.height * channels);
    };
    img.onerror = () => {
      alert("not a valid file: " + file.type);
    };
    img.src = objectUrl;

    let imageBuffer = await prepareImageData(file, "arraybuffer");
    setImageData(new Uint8Array(imageBuffer));
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
      {props.activeOption === 0 ? (
        <ConverterJS
          prepareImageData={prepareImageData}
          imageData={imageData}
        />
      ) : (
        ""
      )}
      {props.activeOption === 1 ? (
        <ConverterWasm
          prepareImageData={prepareImageData}
          imageData={imageData}
          imageArraySize={imageArraySize}
        />
      ) : (
        ""
      )}
    </div>
  );
}
export default Converter;
