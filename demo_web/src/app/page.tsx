"use client";

import React from "react";
import Image from "next/image";
import styles from "./page.module.scss";

import { DataJSON } from "./data";
import CircuitView from "./CircuitView";

export default function Home() {
  const [data, setData] = React.useState<DataJSON>();
  const [circuit, setCircuit] = React.useState("multiplier2");
  const [prime, setPrime] = React.useState("bls12381");

  React.useEffect(() => {
    async function fn() {
      const res = await fetch("/api");
      const data = await res.json();
      setData(data);
    }

    fn().then();
  }, [setData]);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Circuit Viewer (2023)</h1>
      <div className={styles.menuGroup}>
        <div className={styles.menu}>
          <p>Circuits</p>
          <ul>
            <li>
              <button onClick={() => setCircuit("multiplier2")}>
                Multiplier2
              </button>
            </li>
            <li>
              <button onClick={() => setCircuit("vitalik")}>Vitalik</button>
            </li>
            <li>
              <button onClick={() => setCircuit("multiplier3")}>
                Multiplier3
              </button>
            </li>
          </ul>
        </div>

        <div className={styles.menu}>
          <p>Prime</p>
          <ul>
            <li>
              <button onClick={() => setPrime("bls12381")}>Bls12-381</button>
              <button onClick={() => setPrime("secq256k1")}>Secq256k1</button>
            </li>
          </ul>
        </div>
      </div>
      <CircuitView prime={prime} data={data} circuit={circuit} />
    </div>
  );
}
