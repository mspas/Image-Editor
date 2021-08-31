import React, { useState } from "react";
import styles from "./styles/switch.module.sass";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

function Switch(props) {
  const [showMobileNav, setShowMobileNav] = useState(false);

  const handleOptionClick = (data, index) => {
    setShowMobileNav(false);
    props.onOptionClick(data, index);
  };

  let options = props.options.map((data, index) => {
    return (
      <div
        className={
          props.activeOption === index
            ? `${styles.switchOption} ${styles.active}`
            : styles.switchOption
        }
        key={index}
        onClick={props.onOptionClick.bind(null, data, index)}
      >
        <div className={styles.switchOptionContent}>
          <span className={styles.title}>{data.title}</span>
          <span className={styles.titleSm}>{data.subtitle}</span>
        </div>
      </div>
    );
  });

  let mobileOptionsList = props.options.map((data, index) => {
    return (
      <li
        className={
          props.activeOption === index
            ? `${styles.switchOptionMobile} ${styles.activeMobile}`
            : styles.switchOptionMobile
        }
        key={index}
        onClick={handleOptionClick.bind(null, data, index)}
      >
        <div className={styles.switchOptionMobileContent}>
          <span className={styles.title}>{data.title}</span>
          <span className={styles.titleSm}>{data.subtitle}</span>
        </div>
      </li>
    );
  });

  return (
    <div className={styles.navContainer}>
      <div className={styles.mobileContainer}>
        <button
          className={`${styles.mobileNavBtn} button`}
          onClick={() => {
            setShowMobileNav(!showMobileNav);
          }}
        >
          <FontAwesomeIcon icon={showMobileNav ? faTimes : faBars} />
        </button>
        {showMobileNav ? (
          <nav className={styles.mobileNav}>
            <ul>{mobileOptionsList}</ul>
          </nav>
        ) : (
          ""
        )}
      </div>
      <div className={styles.switchContainer}>{options}</div>
    </div>
  );
}
export default Switch;
