import React from "react";
import "./Stats.css";

export default function Stats({ data }) {
  return (
    <div className="stats">
      {data.map((item) => (
        <div key={item.label} className="stat-item">
          <h2>{item.value}+</h2>
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  );
}
