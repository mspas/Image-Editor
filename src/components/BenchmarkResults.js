import React, { useState, useEffect } from "react";
import stylesEditor from "./styles/editor.module.sass";
import styles from "./styles/results.module.sass";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

function BenchmarkResults({
  benchmarkResults,
  techNames,
  funcNames,
  allResultsReady,
}) {
  const [relativeGains, setRelativeGains] = useState([]);
  const techNamesResults = ["asm.js", "WebAssembly"];

  useEffect(() => {
    if (!allResultsReady) return;

    let relativeGainResults = [];
    for (let i = 1; i < techNames.length; i++) {
      relativeGainResults.push([]);
    }
    for (let i = 0; i < relativeGainResults.length; i++) {
      for (let j = 0; j < funcNames.length; j++) {
        relativeGainResults[i].push([]);
      }
    }

    benchmarkResults.forEach((imageResults) => {
      for (let i = 0; i < imageResults.results.length; i++) {
        const imgFuncResults = imageResults.results[i];
        let asmGain = relativeGain(
          imgFuncResults[1].time,
          imgFuncResults[0].time
        );
        let wasmGain = relativeGain(
          imgFuncResults[2].time,
          imgFuncResults[0].time
        );

        relativeGainResults[0][i].push(asmGain);
        relativeGainResults[1][i].push(wasmGain);
      }
    });

    let techMeanResults = [];
    for (let i = 1; i < techNames.length; i++) {
      techMeanResults.push({
        techName: techNames[i],
        functionsGain: [],
      });
    }

    for (let i = 0; i < relativeGainResults.length; i++) {
      for (let j = 0; j < relativeGainResults[i].length; j++) {
        techMeanResults[i].functionsGain.push({
          funcName: funcNames[j],
          meanGain:
            Math.round(
              (mean(relativeGainResults[i][j]) + Number.EPSILON) * 100
            ) / 100,
        });
      }
    }

    console.log(techMeanResults);
    setRelativeGains(techMeanResults);
  }, [allResultsReady]);

  const mean = (array) => {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum / array.length;
  };

  const getResult = (imageResultData, indexTech, funcName) => {
    for (let i = 0; i < imageResultData.results.length; i++) {
      const resSet = imageResultData.results[i];
      for (let j = 0; j < resSet.length; j++) {
        if (resSet[j].tech === indexTech && resSet[j].func === funcName)
          return { time: resSet[j].time, std: resSet[j].std };
      }
    }
  };

  const relativeGain = (moduleResult, jsResult) => {
    return (1 - moduleResult / jsResult) * 100;
  };

  const getRelativeGain = (indexTech, indexFunction) => {
    if (relativeGains.length < 1) return 0;
    return relativeGains[indexTech].functionsGain[indexFunction].meanGain;
  };

  return (
    <div id="results">
      <h1>
        <span>Results - relative gain:</span>
      </h1>
      {allResultsReady ? (
        <div>
          <ReactHTMLTableToExcel
            id="results-xls-button"
            className={stylesEditor.button}
            table="results-table"
            filename="results"
            sheet="results"
            buttonText="Download as XLS"
          />
          <div className={styles.tableWrap}>
            <table className={styles.tableResults} id="results-table">
              <thead>
                <tr>
                  <td>%</td>
                  {funcNames.map((func) => (
                    <td key={func}>{func}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {techNamesResults.map((tech, indexTech) => (
                  <tr key={`${tech}${indexTech}`}>
                    <td className={styles.techTitle}>{tech}</td>
                    {funcNames.map((func, indexFunc) => (
                      <td key={`${tech}${func}`}>
                        <p className={styles.resultTime}>
                          {getRelativeGain(indexTech, indexFunc)}
                        </p>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        ""
      )}

      <h1>
        <span>Results - detailed:</span>
      </h1>
      {allResultsReady ? (
        <ReactHTMLTableToExcel
          id="detailed-results-xls-button"
          className={stylesEditor.button}
          table="detailed-results-table"
          filename="detailed-results"
          sheet="detailed-results"
          buttonText="Download as XLS"
        />
      ) : (
        ""
      )}
      <div className={styles.tableWrap}>
        <table className={styles.tableResults} id="detailed-results-table">
          <thead>
            <tr>
              <td>
                <p className={styles.resultTime}>[ms]</p>
                <span className={styles.resultSTD}>STD</span>
              </td>
              {funcNames.map((func) => (
                <td key={func}>{func}</td>
              ))}
            </tr>
          </thead>
          {benchmarkResults.map((image, index) => (
            <tbody key={`${image.name}${index}`}>
              <tr>
                <td>{image.name}</td>
                {funcNames.map((func) => (
                  <td key={`${func}${index}`}></td>
                ))}
              </tr>
              {techNames.map((tech, index1) => (
                <tr key={`${tech}${index1}`}>
                  <td className={styles.techTitle}>{tech}</td>
                  {funcNames.map((func) => (
                    <td key={`${tech}${func}`}>
                      <p className={styles.resultTime}>
                        {getResult(image, index1, func).time}
                      </p>
                      <span className={styles.resultSTD}>
                        {getResult(image, index1, func).std}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}
export default BenchmarkResults;
