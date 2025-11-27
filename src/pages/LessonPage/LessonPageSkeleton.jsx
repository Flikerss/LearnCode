import React from "react";
import { SkeletonRect, SkeletonText } from "../../components/Skeleton/Skeleton";

export default function LessonPageSkeleton() {
  return (
    <main className="lesson-page skeleton-scope" aria-hidden>
      <aside className="lesson-sidebar">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="chapter-block">
            <SkeletonText width="160px" />
            <ul className="lesson-list">
              {Array.from({ length: 5 }).map((__, i) => (
                <li key={i}>
                  <SkeletonRect width="80%" height={12} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
      <div className="lesson-content-wrapper">
        <div className="lesson-content">
          <SkeletonText width="40%" />
          <div className="lesson-block">
            <SkeletonText width="25%" />
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRect key={i} height={12} width={`${90 - i * 8}%`} />
            ))}
          </div>
          <div className="lesson-block">
            <SkeletonText width="25%" />
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRect key={i} height={12} width={`${85 - i * 10}%`} />
            ))}
          </div>
          <div
            className="lesson-navigation"
            style={{ display: "flex", gap: 12 }}
          >
            <SkeletonRect width={160} height={36} />
            <SkeletonRect width={180} height={36} />
          </div>
        </div>
      </div>
    </main>
  );
}
