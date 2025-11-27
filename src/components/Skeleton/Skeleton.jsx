import React from "react";
import "./Skeleton.css";

export function Skeleton({ className = "", style, as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={`skeleton ${className}`}
      style={style}
      aria-hidden
      {...rest}
    />
  );
}

export function SkeletonText({ width = "60%", style, className = "" }) {
  return (
    <Skeleton
      className={`skeleton--text ${className}`}
      style={{ width, ...style }}
    />
  );
}

export function SkeletonCircle({ size = 40, className = "" }) {
  return (
    <Skeleton
      className={`skeleton--circle ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonRect({ width = "100%", height = 16, className = "" }) {
  return (
    <Skeleton
      className={`skeleton--rect ${className}`}
      style={{ width, height }}
    />
  );
}

export default Skeleton;
