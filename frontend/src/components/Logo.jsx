import React from "react";

export default function Logo({ className = "h-9 w-auto", alt = "MAQSYMA" }) {
  return (
    <img
      src="/assets/Logo_MAQSYMA.png"
      alt={alt}
      className={`object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
