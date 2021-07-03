import React, { useState, useEffect } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";

function Benchmark(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Loading images...");
  const [imagesData, setImagesData] = useState([]);
  const [imagesSizes, setImagesSizes] = useState([]);
  const [imagesCount, setImagesCount] = useState(0);
  const [imagesFoundCount, setImagesFoundCount] = useState(-1);
  const [benchmarkResults, setBenchmarkResults] = useState([]);

  const funcNames = [
    "rotate180",
    "rotate90",
    "mirror",
    "invert",
    "brighten",
    "gray",
    "crop",
  ];
  const techNames = ["JavaScript", "asm.js", "WebAssembly"];

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

  useEffect(() => {
    if (props.worker)
      props.worker.onmessage = (event) => {
        console.log(event);
        if (event.data.results) {
          console.log(event.data.results);
          setBenchmarkResults(event.data.results);
          if (event.data.nextImage) {
            setMessage(`Now testing for ${event.data.nextImage} image...`);
          } else {
            setIsLoading(false);
            setMessage(`Tests done!`);
          }

          /*setTime(event.data.time);
          setLoadingMessage("Preparing image preview...");
          setOutputData({
            imageData: event.data.imageData,
            width: event.data.width,
            height: event.data.height,
          });*/
        }
      };
  }, [props.worker]);

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

  const testHandler = async () => {
    const iterations = 10;
    const channels = 4; //RGBA

    setMessage(`Starting tests for ${imagesCount} images...`);
    setIsLoading(true);

    window.scrollTo(0, document.body.scrollHeight);

    let imagesDataSet = [];
    for (let i = 0; i < imagesData.length; i++) {
      const imageData = imagesData[i];

      let data = {
        data: imageData,
        name: imagesSizes[i].name,
        width: imagesSizes[i].width,
        height: imagesSizes[i].height,
        length: imageData.length,
      };

      imagesDataSet.push(data);
    }
    console.log(imagesDataSet);

    props.worker.postMessage({
      tech: -1,
      imagesData: imagesDataSet,
      channels: channels,
      iterations: iterations,
      brightnessValue: 40,
    });
  };

  const getResult = (imageResultData, indexTech, funcName) => {
    for (let i = 0; i < imageResultData.results.length; i++) {
      const resSet = imageResultData.results[i];
      for (let j = 0; j < resSet.length; j++) {
        if (resSet[j].tech === indexTech && resSet[j].func === funcName)
          return `${resSet[j].time}ms (std = ${resSet[j].std})`;
      }
    }
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
      <p>{message}</p>
      {isLoading ? (
        <div>
          <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
        </div>
      ) : (
        ""
      )}
      <p>Results:</p>
      {benchmarkResults.map((image, index) => (
        <table key={`${image.name}${index}`}>
          <thead>
            <tr>
              <td>{image.name}</td>
              {funcNames.map((func) => (
                <td key={func}>{func}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {techNames.map((tech, index1) => (
              <tr key={`${tech}${index1}`}>
                <td>{tech}</td>
                {funcNames.map((func) => (
                  <td key={`${tech}${func}`}>
                    {getResult(image, index1, func)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}
export default Benchmark;
