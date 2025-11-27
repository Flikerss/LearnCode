import React, { useState, useEffect } from "react";
import "./Codeblock.css";

export default function Codeblock() {
  const words = [
    "const app = 'LearnCode'",
    "function LearnCode() { }",
    "Начать обучение.....",
  ];

  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    const speed = deleting ? 40 : 100;

    const timeout = setTimeout(() => {
      setDisplayed((prev) =>
        deleting
          ? current.substring(0, prev.length - 1)
          : current.substring(0, prev.length + 1)
      );

      if (!deleting && displayed === current) {
        setTimeout(() => setDeleting(true), 1000);
      } else if (deleting && displayed === "") {
        setDeleting(false);
        setIndex((prev) => prev + 1);
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayed, deleting, index]);

  return (
    <div className="code-container">
      <pre className="code-block">
        <span className="keyword">const</span> message{" "}
        <span className="operator">=</span>{" "}
        <span className="string">"{displayed}"</span>
        <span className="cursor">|</span>
      </pre>
    </div>
  );
}
