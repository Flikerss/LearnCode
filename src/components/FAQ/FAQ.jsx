import React, { useState } from "react";
import "./FAQ.css";

export default function FAQ({ data }) {
  return (
    <div className="faq">
      <h2>Частые вопросы</h2>
      {data.map((item, index) => (
        <FAQItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`faq-item ${open ? "open" : ""}`}
      onClick={() => setOpen(!open)}
    >
      <div className="faq-header">
        <span>{question}</span>
        <span className="faq-icon">{open ? "−" : "+"}</span>
      </div>
      {open && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
