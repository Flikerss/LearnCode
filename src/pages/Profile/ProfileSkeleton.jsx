import React from "react";
import {
  SkeletonCircle,
  SkeletonRect,
  SkeletonText,
} from "../../components/Skeleton/Skeleton";
import "./Profile.css";

export default function ProfileSkeleton() {
  return (
    <div className="profile-wrapper skeleton-scope" aria-hidden>
      <div className="profile-header">
        <SkeletonRect width={140} height={36} />
      </div>
      <div className="profile-main">
        <div className="profile-user-card">
          <div className="profile-avatar">
            <SkeletonCircle size={96} />
          </div>
          <h2 className="profile-name">
            <SkeletonText width="50%" />
          </h2>
          <p className="profile-email">
            <SkeletonText width="60%" />
          </p>
          <p className="profile-date">
            <SkeletonText width="40%" />
          </p>
          <div
            className="currency-box"
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <SkeletonRect width={24} height={24} />
            <SkeletonText width={60} />
            <SkeletonRect width={20} height={20} />
          </div>
          <SkeletonRect width={180} height={36} />
          <SkeletonRect width={140} height={36} />
        </div>

        <div className="profile-achievements">
          <h3>
            <span className="sr-only">Ачивки</span>
          </h3>
          <div className="achievements-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="achievement-card" key={i}>
                <div className="achievement-image">
                  <SkeletonRect width={64} height={64} />
                </div>
                <div className="achievement-text">
                  <SkeletonText width="70%" />
                </div>
              </div>
            ))}
          </div>
          <SkeletonRect width={220} height={36} />
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
            <SkeletonText width={40} />
            <SkeletonRect width={110} height={32} />
          </div>
        </div>
      </div>
    </div>
  );
}
