import React from "react";
import { Skeleton } from "@mui/material";
import "./Profile.css";

export default function ProfileSkeleton() {
  return (
    <div className="profile-wrapper" aria-hidden>
      <div className="profile-header">
        <Skeleton variant="rectangular" width={140} height={36} />
      </div>
      <div className="profile-main">
        <div className="profile-user-card">
          <div className="profile-avatar">
            <Skeleton variant="circular" width={96} height={96} />
          </div>
          <h2 className="profile-name">
            <Skeleton variant="text" width="50%" />
          </h2>
          <p className="profile-email">
            <Skeleton variant="text" width="60%" />
          </p>
          <p className="profile-date">
            <Skeleton variant="text" width="40%" />
          </p>
          <div
            className="currency-box"
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <Skeleton variant="rectangular" width={24} height={24} />
            <Skeleton variant="text" width={60} />
            <Skeleton variant="rectangular" width={20} height={20} />
          </div>
          <Skeleton variant="rectangular" width={180} height={36} />
          <Skeleton variant="rectangular" width={140} height={36} />
        </div>

        <div className="profile-achievements">
          <h3>
            <span className="sr-only">Ачивки</span>
          </h3>
          <div className="achievements-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="achievement-card" key={i}>
                <div className="achievement-image">
                  <Skeleton variant="rectangular" width={64} height={64} />
                </div>
                <div className="achievement-text">
                  <Skeleton variant="text" width="70%" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton variant="rectangular" width={220} height={36} />
        </div>

        <div className="profile-progress-area">
          <h3>
            <span className="sr-only">Прогресс</span>
          </h3>
          <div
            className="profile-progress-main"
            style={{ display: "flex", gap: 12, alignItems: "center" }}
          >
            <div className="bar" style={{ width: "100%" }}>
              <div className="fill" style={{ width: 0 }} />
            </div>
            <Skeleton variant="text" width={40} />
            <Skeleton variant="rectangular" width={110} height={32} />
          </div>
        </div>
      </div>
    </div>
  );
}
