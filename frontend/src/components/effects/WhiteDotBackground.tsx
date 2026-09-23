"use client";

import React, { useEffect, useRef } from "react";

interface WhiteDotBackgroundProps {
  dotCount?: number;
  maxRadius?: number;
  minRadius?: number;
  connectionDistance?: number;
  speed?: number;
  className?: string;
  showLines?: boolean;
}

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  phase: number;
  pulseSpeed: number;
}

export const WhiteDotBackground: React.FC<WhiteDotBackgroundProps> = ({
  dotCount = 90,
  maxRadius = 2.2,
  minRadius = 1.0,
  connectionDistance = 110,
  speed = 0.5,
  className = "",
  showLines = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Mouse coordinates for subtle interactive repulsion
    let mouse = { x: -1000, y: -1000, radius: 120 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Initialize dots
    const dots: Dot[] = [];
    for (let i = 0; i < dotCount; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: minRadius + Math.random() * (maxRadius - minRadius),
        baseAlpha: 0.25 + Math.random() * 0.65,
        alpha: 0.5,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Draw faint dot grid in background for institutional depth
      const gridSpacing = 36;
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      for (let gx = 0; gx < width; gx += gridSpacing) {
        for (let gy = 0; gy < height; gy += gridSpacing) {
          ctx.beginPath();
          ctx.arc(gx, gy, 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update and draw floating white dots
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Move
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Wrap around edges
        if (dot.x < -10) dot.x = width + 10;
        else if (dot.x > width + 10) dot.x = -10;
        if (dot.y < -10) dot.y = height + 10;
        else if (dot.y > height + 10) dot.y = -10;

        // Mouse repulsion
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouse.radius - dist) / mouse.radius;
          dot.x += Math.cos(angle) * force * 2.5;
          dot.y += Math.sin(angle) * force * 2.5;
        }

        // Twinkle / pulse opacity
        dot.phase += dot.pulseSpeed;
        dot.alpha = Math.max(0.15, Math.min(1.0, dot.baseAlpha + Math.sin(dot.phase) * 0.25));

        // Draw dot with glowing core
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${dot.alpha})`;
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 6;
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;

        // Connect nearby dots with faint white line
        if (showLines) {
          for (let j = i + 1; j < dots.length; j++) {
            const other = dots[j];
            const distBetween = Math.hypot(dot.x - other.x, dot.y - other.y);
            if (distBetween < connectionDistance) {
              const lineAlpha = (1 - distBetween / connectionDistance) * 0.12 * Math.min(dot.alpha, other.alpha);
              ctx.beginPath();
              ctx.moveTo(dot.x, dot.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
              ctx.lineWidth = 0.75;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dotCount, maxRadius, minRadius, connectionDistance, speed, showLines]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle radial vignette so center content has crisp contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
    </div>
  );
};

export default WhiteDotBackground;
