import React from "react";
import "./Reviews.css";

export default function Reviews() {
  return (
    <section className="reviews">
      <h2>Отзывы учеников</h2>
      <div className="reviews-cards">
        <div className="review-card">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.</p>
          <span>- Иван П.</span>
        </div>
        <div className="review-card">
          <p>Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum.</p>
          <span>- Мария С.</span>
        </div>
        <div className="review-card">
          <p>Maecenas malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <span>- Алексей К.</span>
        </div>
      </div>
    </section>
  );
}
