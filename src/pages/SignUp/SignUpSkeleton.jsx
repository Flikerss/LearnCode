import React from "react";
import { Skeleton } from "@mui/material";

export default function SignUpSkeleton() {
  return (
    <section className="auth-page" aria-hidden>
      <div className="auth-container">
        <Skeleton variant="text" width="30%" />
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <Skeleton variant="text" width="20%" />
          <Skeleton variant="rectangular" height={40} />
          <Skeleton variant="text" width="20%" />
          <Skeleton variant="rectangular" height={40} />
          <Skeleton variant="text" width="20%" />
          <Skeleton variant="rectangular" height={40} />
          <Skeleton variant="rectangular" height={44} />
        </div>
      </div>
    </section>
  );
}
