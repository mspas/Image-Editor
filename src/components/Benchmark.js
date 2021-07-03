import React, { useState, useEffect, useRef } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";

function Benchmark(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Loading images...");
  const [time, setTime] = useState(0);
  const [imagesData, setImagesData] = useState([]);
  const [imagesSizes, setImagesSizes] = useState([]);
  const [imagesCount, setImagesCount] = useState(0);
  const [imagesFoundCount, setImagesFoundCount] = useState(-1);

  useEffect(() => {
    const images = importAll(
      require.context("../media", false, /\.(png|jpe?g|svg)$/)
    );
    setImagesFoundCount(images.length);

    let e = document.getElementById("resultdupa");

    loadImages(e, images);
  }, []);

  useEffect(() => {
    if (imagesCount === imagesFoundCount) {
      setIsLoading(false);
      setMessage(`${imagesCount} images loaded`);
    }
  }, [imagesCount]);

  const loadImages = (parent, images) => {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < images.length; i++) {
        const img = document.createElement("img");
        img.onload = onImgLoad;
        img.src = images[i].url;
        img.value = images[i].name;
        parent.appendChild(img);
        parent.removeChild(img);
        if (i === images.length - 1) resolve(true);
      }
    });
  };

  const onImgLoad = ({ target: img }) => {
    var canvas = props.toCanvas(img);
    let ctx = canvas.getContext("2d");
    ctx.globalAlpha = 1.0;
    let dataImg = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let data = imagesData;
    let sizes = imagesSizes;

    data.push(dataImg.data);
    sizes.push({
      name: img.value,
      width: dataImg.width,
      height: dataImg.height,
    });

    setImagesData(data);
    setImagesSizes(sizes);
    setImagesCount(data.length);
  };

  const importAll = (r) => {
    let images = [];
    r.keys().map((item, index) => {
      let name = item.replace("./", "");
      images.push({ name: name.replace(".jpg", ""), url: r(item) });
    });
    return images;
  };

  const mean = (array) => {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum / array.length;
  };

  const standardDeviation = (array) => {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(
      array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
    );
  };

  const testHandler = async () => {
    console.log(imagesData);

    const iterations = 1;

    setIsLoading(true);
    let dupa = new Uint8ClampedArray();

    setIsLoading(false);
  };

  return (
    <div className={styles.resultBox} id="resultdupa">
      {!isLoading && imagesCount === imagesFoundCount ? (
        <button className={styles.button} onClick={testHandler}>
          Test
        </button>
      ) : (
        ""
      )}
      {time > 0 ? (
        <div className={styles.alert}>
          Execution of this task took {time} ms.
        </div>
      ) : (
        ""
      )}
      <p>{message}</p>
      {isLoading ? (
        <div>
          <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
export default Benchmark;
