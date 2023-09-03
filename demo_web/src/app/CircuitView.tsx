"use client";

import React from "react";
import cn from "classnames";
import Image from "next/image";
import styles from "./CircuitView.module.scss";

import { DataJSON } from "./data";

const CircuitView: React.FC<CircuitViewProps> = ({ circuit, data, prime }) => {
  const elem = React.useMemo(() => {
    if (data) {
      const { fileContent } = data[circuit];
      const { constraints } = data[circuit].analysis[prime];

      let skipped = false;
      let constraintIdx = 0;
      const elems: React.ReactNode[] = [];

      elems.push(
        <div className={styles.row} key="first">
          <div className={styles.lineNo}></div>
          <div className={styles.line}></div>
          <div className={styles.polyCol}>A</div>
          <div className={styles.polyCol}>B</div>
          <div className={styles.polyCol}>C</div>
        </div>
      );

      fileContent.forEach((line, idx) => {
        let aElem = [],
          bElem = [],
          cElem = [];
        let isSelected = false;

        if (
          line.includes("component") ||
          line.includes("<==") ||
          line.includes("===")
        ) {
          if (!line.includes("component main") && !line.includes("//")) {
            // ad hoc
            if (circuit === "multiplier3" && !skipped) {
              skipped = true;
              // return;
            } else {
              // console.log(1, constraints, constraintIdx);
              const row = constraints[constraintIdx];

              if (row) {
                const [a, b, c] = row;
                isSelected = true;
                // console.log("a", a);
                for (const [k, v] of Object.entries(a)) {
                  aElem.push(`${k} * ${v}`);
                }

                // console.log("bbb", b);
                for (const [k, v] of Object.entries(b)) {
                  bElem.push(`${k} * ${v}`);
                }

                // console.log("c", c);

                for (const [k, v] of Object.entries(c)) {
                  cElem.push(`${k} * ${v}`);
                }
                constraintIdx += 1;
              }
            }
          }
        }

        const whitespaceElem = [];
        for (let idx = 0; idx < line.length; idx += 1) {
          if (line[idx] !== " ") {
            break;
          }
          whitespaceElem.push(
            <span key={idx} className={styles.whitespace}></span>
          );
        }

        elems.push(
          <div
            className={cn({
              [styles.row]: true,
              [styles.selected]: isSelected,
            })}
            key={idx}
          >
            <div className={styles.lineNo}>{idx + 1}</div>
            <div className={styles.line}>
              {whitespaceElem}
              {line}
            </div>
            <div className={cn(styles.polyCol, styles.colA)}>
              {aElem.join(" + ")}
            </div>
            <div className={styles.polyCol}>{bElem.join(" + ")}</div>
            <div className={styles.polyCol}>{cElem.join(" + ")}</div>
          </div>
        );
      });

      return elems;
    } else {
      return <div>Loading...</div>;
    }
  }, [data, prime, circuit]);

  return <div className={styles.wrapper}>{elem}</div>;
};

export default CircuitView;

export interface CircuitViewProps {
  circuit: string;
  prime: string;
  data: DataJSON | undefined;
}
