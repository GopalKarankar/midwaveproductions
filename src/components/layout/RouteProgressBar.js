"use client";

import NextTopLoader from "nextjs-toploader";
import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

export default function RouteProgressBar() {
  const shouldReduceMotion = useFramerReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <NextTopLoader
      color="#3AAFE0"
      height={3}
      showSpinner={false}
      shadow={false}
      speed={200}
      easing="ease"
    />
  );
}
