import React, { useState } from "react";
import styles from "./styles/converter.module.sass";
import ConverterJS from "./ConverterJS";
import ConverterWasm from "./ConverterWasm";
import ConverterShareLib from "./ConverterShareLib";

function Converter(props) {
  const [imageData, setImageData] = useState();
  const [imageDataCanvas, setImageDataCanvas] = useState();
  const [imageDataURL, setImageDataURL] = useState();
  const [imageArraySize, setImageArraySize] = useState(0);

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

  const toCanvas = (source) => {
    if (source instanceof HTMLCanvasElement) {
      return source;
    }
    const canvas = document.createElement("canvas");
    canvas.width = source.videoWidth || source.naturalWidth || source.width;
    canvas.height = source.videoHeight || source.naturalHeight || source.height;
    canvas
      .getContext("2d")
      .drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  const onImgLoad = ({ target: img }) => {
    var canvas = toCanvas(img);
    let ctx = canvas.getContext("2d");
    ctx.globalAlpha = 1.0;
    let dataImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setImageDataCanvas(dataImg.data);
    setImageArraySize({ height: dataImg.height, width: dataImg.width });
  };

  const imageSelectHandler = async (event) => {
    let file = event.target.files[0];
    setImageDataURL(URL.createObjectURL(file));

    let imageBuffer = await prepareImageData(file, "arraybuffer");
    setImageData(new Uint8Array(imageBuffer));

    scrollBottom();
  };

  const scrollBottom = () => {
    setTimeout(() => {
      let element = document.body;
      element.scrollIntoView({
        alignToTop: false,
        behavior: "smooth",
        block: "end",
      });
    }, 100);
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
      {imageData ? (
        <img src={imageDataURL} onLoad={onImgLoad} alt="Select" />
      ) : (
        "Select image"
      )}
      {props.activeOption === 0 ? (
        <ConverterJS
          prepareImageData={prepareImageData}
          imageData={imageDataCanvas}
          imageArraySize={imageArraySize}
          scrollBottom={scrollBottom}
        />
      ) : (
        ""
      )}
      {props.activeOption === 1 ? (
        <ConverterShareLib
          prepareImageData={prepareImageData}
          imageData={imageData}
          scrollBottom={scrollBottom}
        />
      ) : (
        ""
      )}
      {props.activeOption === 2 ? (
        <ConverterWasm
          prepareImageData={prepareImageData}
          imageData={imageDataCanvas}
          imageArraySize={imageArraySize}
          scrollBottom={scrollBottom}
        />
      ) : (
        ""
      )}
    </div>
  );
}
export default Converter;
