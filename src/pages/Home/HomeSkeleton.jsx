import React from "react";
import { SkeletonRect, SkeletonText } from "../../components/Skeleton/Skeleton";

export default function HomeSkeleton() {
  return (
    <section className="home skeleton-scope" aria-hidden>
      <div className="container">
        <SkeletonText width="35%" />
        <SkeletonRect height={14} width="80%" />
        <SkeletonRect height={14} width="70%" />

        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: 16 }}>
              <SkeletonText width="60%" />
              <SkeletonRect height={12} width="90%" />
              <SkeletonRect height={12} width="85%" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
