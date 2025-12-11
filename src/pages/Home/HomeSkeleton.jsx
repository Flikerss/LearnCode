import React from "react";
import { Skeleton } from "@mui/material";

export default function HomeSkeleton() {
  return (
    <section className="home" aria-hidden>
      <div className="container">
        <Skeleton variant="text" width="35%" />
        <Skeleton variant="rectangular" height={14} width="80%" />
        <Skeleton variant="rectangular" height={14} width="70%" />

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
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={12} width="90%" />
              <Skeleton variant="rectangular" height={12} width="85%" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
