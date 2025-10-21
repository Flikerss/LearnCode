import React from "react";
import "./FAQ.css";

export default function FAQ({ data }) {
  return (
    <div className="faq">
      <h2>Частые вопросы</h2>
      {data.map((item, index) => (
        <details key={index}>
          <summary>
            <span>{item.question}</span>
            <span className="faq-icon">+</span>
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
