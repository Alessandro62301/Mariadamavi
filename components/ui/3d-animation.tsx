"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import styles from "./3d-animation.module.css";

type PoemAnimationProps = {
  poemHTML: string;
  backgroundImageUrl: string;
};

export function PoemAnimation({
  poemHTML,
  backgroundImageUrl,
}: PoemAnimationProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updatePointer = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      stage.style.setProperty("--pointer-x", `${x * 7}deg`);
      stage.style.setProperty("--pointer-y", `${y * -5}deg`);
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, []);

  return (
    <header className={styles.hero} id="topo">
      <Image
        src={backgroundImageUrl}
        alt="Maria Victória, fundadora da Mavi"
        fill
        priority
        sizes="100vw"
        className={styles.backgroundImage}
      />
      <div className={styles.colorWash} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.stage} ref={stageRef} aria-hidden="true">
        <div className={`${styles.cube} ${styles.cubeTop}`}>
          <div className={`${styles.face} ${styles.faceFront}`}>
            <div className={`${styles.marquee} ${styles.marqueeLeft}`} dangerouslySetInnerHTML={{ __html: poemHTML }} />
          </div>
          <div className={`${styles.face} ${styles.faceTop}`}>
            <div className={`${styles.marquee} ${styles.marqueeRight}`} dangerouslySetInnerHTML={{ __html: poemHTML }} />
          </div>
        </div>

        <div className={`${styles.cube} ${styles.cubeBottom}`}>
          <div className={`${styles.face} ${styles.faceFront}`}>
            <div className={`${styles.marquee} ${styles.marqueeRight}`} dangerouslySetInnerHTML={{ __html: poemHTML }} />
          </div>
          <div className={`${styles.face} ${styles.faceBottom}`}>
            <div className={`${styles.marquee} ${styles.marqueeLeft}`} dangerouslySetInnerHTML={{ __html: poemHTML }} />
          </div>
        </div>
      </div>

      <div className={styles.scrollCue} aria-hidden="true">
        <span>CONHEÇA A MAVI</span>
        <i />
      </div>
    </header>
  );
}
