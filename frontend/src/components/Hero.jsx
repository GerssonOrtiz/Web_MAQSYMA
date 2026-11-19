import React from "react";
import HeroCinematic from "./HeroCinematic";

/**
 * Hero component principal configurado con HeroCinematic
 */
export default function Hero({ onReady }) {
  return <HeroCinematic onReady={onReady} />;
}
