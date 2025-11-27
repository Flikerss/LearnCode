import React from "react";
import {
  SkeletonCircle,
  SkeletonRect,
  SkeletonText,
} from "../../components/Skeleton/Skeleton";

export default function AboutSkeleton() {
  return (
    <div className="skeleton-scope" aria-hidden>
      <section className="about">
        <div className="container">
          <SkeletonText width="30%" />
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonRect key={i} height={14} width={`${90 - i * 10}%`} />
          ))}
        </div>

        <div
          className="team"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="team-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <SkeletonCircle size={80} />
              <SkeletonText width="60%" />
              <SkeletonText width="50%" />
            </div>
          ))}
        </div>

        <div
          className="stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginTop: 16,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card" style={{ padding: 12 }}>
              <SkeletonText width="40%" />
              <SkeletonText width="30%" />
            </div>
          ))}
        </div>

        <div className="faq" style={{ marginTop: 24 }}>
          <SkeletonText width="25%" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ marginTop: 8 }}>
              <SkeletonRect height={16} width={`${95 - i * 8}%`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
