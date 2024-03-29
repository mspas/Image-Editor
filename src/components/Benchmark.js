import React, { useState, useEffect } from "react";
import styles from "./styles/editor.module.sass";
import Loader from "react-loader-spinner";
import OptionSelector from "./OptionSelector";
import BenchmarkResults from "./BenchmarkResults";

function Benchmark(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [testClicked, setTestClicked] = useState(false);
  const [message, setMessage] = useState("Loading images...");
  const [imagesData, setImagesData] = useState([]);
  const [imagesSizes, setImagesSizes] = useState([]);
  const [imagesCount, setImagesCount] = useState(0);
  const [selectedImagesCount, setSelectedImagesCount] = useState(0);
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
  const iterations = 100;

  useEffect(() => {
    const images = importAll(
      require.context("../media", false, /\.(png|jpe?g|svg)$/)
    );
    setImagesFoundCount(images.length);

    let e = document.getElementById("main-container");

    loadImages(e, images);
  }, []);

  useEffect(() => {
    if (imagesCount === imagesFoundCount) {
      setIsLoading(false);
      setMessage(`${imagesCount} images loaded:`);
    }
  }, [imagesCount]);

  useEffect(() => {
    if (props.worker)
      props.worker.onmessage = (event) => {
        if (event.data.results) {
          //console.log(event.data.results);
          setBenchmarkResults(event.data.results);
          if (event.data.nextImage) {
            setMessage(`Now testing for ${event.data.nextImage} image...`);
          } else {
            setIsLoading(false);
            setMessage(`Tests done!`);
            console.log(event.data.results);
          }
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
    const res = props.imgToCanvas(img);

    let data = imagesData;
    let sizes = imagesSizes;

    data.push(res.data);
    sizes.push({
      name: img.value ? img.value : "",
      width: res.width,
      height: res.height,
      selected: true,
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

  const imagePickerHandler = (index, value) => {
    let data = imagesSizes;

    data[index].selected = value;

    setImagesSizes(data);
  };

  const testHandler = async () => {
    const channels = 4; //RGBA

    setMessage(`Starting tests for ${imagesCount} images...`);
    setIsLoading(true);
    setTestClicked(true);

    window.scrollTo(0, document.body.scrollHeight);

    let imagesDataSet = [],
      selectedCount = 0;
    for (let i = 0; i < imagesData.length; i++) {
      const imageData = imagesData[i];

      if (!imagesSizes[i].selected) continue;

      let data = {
        data: imageData,
        name: imagesSizes[i].name,
        width: imagesSizes[i].width,
        height: imagesSizes[i].height,
        length: imageData.length,
      };

      selectedCount++;
      imagesDataSet.push(data);
    }

    setSelectedImagesCount(selectedCount);

    props.worker.postMessage({
      tech: -1,
      imagesData: imagesDataSet,
      channels: channels,
      iterations: iterations,
      brightnessValue: 40,
    });
  };

  return (
    <div className={styles.resultBox} id="main-container">
      {!isLoading && imagesCount === imagesFoundCount ? (
        <div>
          <p>{message}</p>
          <OptionSelector
            options={imagesSizes}
            clickHandler={imagePickerHandler}
            selectorType={"checkbox"}
          />
          <button className={styles.button} onClick={testHandler}>
            Test
          </button>
        </div>
      ) : (
        ""
      )}
      <p>
        {testClicked
          ? `Number of iterations: ${iterations}. ${message}`
          : `Number of iterations: ${iterations}`}
        {testClicked
          ? ` (${benchmarkResults.length}/${selectedImagesCount})`
          : ""}
      </p>
      {isLoading ? (
        <div>
          <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
        </div>
      ) : (
        ""
      )}

      <BenchmarkResults
        benchmarkResults={benchmarkResults}
        techNames={techNames}
        funcNames={funcNames}
        allResultsReady={!isLoading && testClicked ? true : false}
      />
    </div>
  );
}
export default Benchmark;
