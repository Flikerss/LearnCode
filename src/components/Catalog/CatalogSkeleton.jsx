import React from "react";
import { SkeletonRect, SkeletonText } from "../Skeleton/Skeleton";

export default function CatalogSkeleton({ chapters = 2, cardsPerChapter = 4 }) {
  return (
    <div className="catalog skeleton-scope" aria-hidden>
      {Array.from({ length: chapters }).map((_, cIdx) => (
        <div key={cIdx} className="chapter">
          <div className="chapter-header">
            <SkeletonText width="220px" />
            <div className="progress-bar">
              <div className="progress" style={{ width: 0 }} />
            </div>
          </div>
          <div className="lessons-list">
            {Array.from({ length: cardsPerChapter }).map((__, i) => (
              <div key={i} className="lesson-card">
                <SkeletonRect width="70%" height={14} />
                <SkeletonText width="40%" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <span className="sr-only">Загрузка каталога…</span>
    </div>
  );
}
