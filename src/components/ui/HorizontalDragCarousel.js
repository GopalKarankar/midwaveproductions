"use client";
import { useRef, useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { animate } from "framer-motion";

export function HorizontalDragCarousel({ children, showControls = false }) {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  function updateScrollState() {
    if (!ref.current) return;
    const { scrollLeft: sl, scrollWidth, clientWidth } = ref.current;
    setScrollPos(sl);
    setCanScrollLeft(sl > 0);
    setCanScrollRight(sl < scrollWidth - clientWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const container = ref.current;
    if (!container) return;
    container.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  function onPointerDown(e) {
    setIsDragging(true);
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }

  function onPointerUp() {
    setIsDragging(false);
  }

  function slideCarousel(direction) {
    if (!ref.current || !ref.current.firstChild) return;
    const firstChild = ref.current.firstChild;
    const step = firstChild.offsetWidth + 16;
    const currentScroll = ref.current.scrollLeft;
    const targetScroll = direction === "left"
      ? Math.max(0, currentScroll - step)
      : currentScroll + step;

    const duration = shouldReduceMotion ? 0.01 : 0.8;
    animate(currentScroll, targetScroll, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.scrollLeft = v;
      },
    });
  }

  return (
    <div>
      <div
        ref={ref}
        className={`flex gap-4 overflow-x-auto scrollbar-none pb-4 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {children}
      </div>
      {showControls && (
        <div className="flex gap-3 items-center justify-center mt-4">
          <button
            onClick={() => slideCarousel("left")}
            disabled={!canScrollLeft}
            aria-label="Previous"
            className="flex items-center justify-center size-10 border border-border hover:border-accent transition-colors duration-200 disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="text-highlight">←</span>
          </button>
          <button
            onClick={() => slideCarousel("right")}
            disabled={!canScrollRight}
            aria-label="Next"
            className="flex items-center justify-center size-10 border border-border hover:border-accent transition-colors duration-200 disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="text-highlight">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
