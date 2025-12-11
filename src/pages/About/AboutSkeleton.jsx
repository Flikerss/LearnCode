import React from "react";
import { Skeleton } from "@mui/material";

export default function AboutSkeleton() {
  return (
    <div aria-hidden>
      <section className="about">
        <div className="container">
          <Skeleton variant="text" width="30%" />
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={14}
              width={`${90 - i * 10}%`}
            />
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
              <Skeleton variant="circular" width={80} height={80} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="50%" />
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
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="30%" />
            </div>
          ))}
        </div>

        <div className="faq" style={{ marginTop: 24 }}>
          <Skeleton variant="text" width="25%" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ marginTop: 8 }}>
              <Skeleton
                variant="rectangular"
                height={16}
                width={`${95 - i * 8}%`}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
