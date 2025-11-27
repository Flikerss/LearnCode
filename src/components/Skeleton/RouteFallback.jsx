import React from "react";
import "./Skeleton.css";

export default function RouteFallback() {
  return (
    <div className="skeleton-scope route-fallback" aria-hidden>
      <div className="route-fallback__bar" />
    </div>
  );
}
