import React from "react";
import { Skeleton } from "@mui/material";

export default function LessonPageSkeleton() {
  return (
    <main className="lesson-page" aria-hidden>
      <aside className="lesson-sidebar">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="chapter-block">
            <Skeleton variant="text" width={160} />
            <ul className="lesson-list">
              {Array.from({ length: 5 }).map((__, i) => (
                <li key={i}>
                  <Skeleton variant="rectangular" width="80%" height={12} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
      <div className="lesson-content-wrapper">
        <div className="lesson-content">
          <Skeleton variant="text" width="40%" />
          <div className="lesson-block">
            <Skeleton variant="text" width="25%" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={12}
                width={`${90 - i * 8}%`}
              />
            ))}
          </div>
          <div className="lesson-block">
            <Skeleton variant="text" width="25%" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={12}
                width={`${85 - i * 10}%`}
              />
            ))}
          </div>
          <div
            className="lesson-navigation"
            style={{ display: "flex", gap: 12 }}
          >
            <Skeleton variant="rectangular" width={160} height={36} />
            <Skeleton variant="rectangular" width={180} height={36} />
          </div>
        </div>
      </div>
    </main>
  );
}
