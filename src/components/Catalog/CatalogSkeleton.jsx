import React from "react";
import { Skeleton } from "@mui/material";

export default function CatalogSkeleton({ chapters = 2, cardsPerChapter = 4 }) {
  return (
    <div className="catalog" aria-hidden>
      {Array.from({ length: chapters }).map((_, cIdx) => (
        <div key={cIdx} className="chapter">
          <div className="chapter-header">
            <Skeleton variant="text" width={220} />
            <div className="progress-bar">
              <div className="progress" style={{ width: 0 }} />
            </div>
          </div>
          <div className="lessons-list">
            {Array.from({ length: cardsPerChapter }).map((__, i) => (
              <div key={i} className="lesson-card">
                <Skeleton variant="rectangular" width="70%" height={14} />
                <Skeleton variant="text" width="40%" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <span className="sr-only">Загрузка каталога…</span>
    </div>
  );
}
