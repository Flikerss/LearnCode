import React from "react";
import { SkeletonRect, SkeletonText } from "../../components/Skeleton/Skeleton";

export default function SignInSkeleton() {
  return (
    <section className="auth-page skeleton-scope" aria-hidden>
      <div className="auth-container">
        <SkeletonText width="30%" />
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <SkeletonText width="20%" />
          <SkeletonRect height={40} />
          <SkeletonText width="20%" />
          <SkeletonRect height={40} />
          <SkeletonRect height={44} />
        </div>
      </div>
    </section>
  );
}
