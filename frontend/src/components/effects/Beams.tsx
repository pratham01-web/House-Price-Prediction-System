import React, { useEffect, useRef } from "react";

interface BeamsProps {
  beamWidth?: number;
  beamHeight?: number;
  beamNumber?: number;
  lightColor?: string;
  beamColor?: string;
  speed?: number;
  noiseIntensity?: number;
  className?: string;
}

export const Beams: React.FC<BeamsProps> = ({
  beamWidth = 2,
  beamHeight = 250,
  beamNumber = 12,
  lightColor = "rgba(99, 102, 241, 0.4)",
  beamColor = "rgba(139, 92, 246, 0.2)",
  speed = 0.5,
  noiseIntensity = 0.3,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect user reduced-motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initialize beam particles
    const beams: {
      x: number;
      y: number;
      length: number;
      width: number;
      speed: number;
      opacity: number;
      angle: number;
    }[] = [];

    for (let i = 0; i < beamNumber; i++) {
      beams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: beamHeight * (0.6 + Math.random() * 0.8),
        width: beamWidth * (0.8 + Math.random() * 1.5),
        speed: speed * (0.3 + Math.random() * 0.7),
        opacity: 0.1 + Math.random() * 0.3,
        angle: -Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 degree soft ray
      });
    }

    let time = 0;
    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Render drifting volumetric beams
      beams.forEach((beam) => {
        beam.y -= beam.speed;
        beam.x += Math.sin(time * noiseIntensity + beam.y * 0.01) * 0.3;

        // Reset if drifted above top
        if (beam.y + beam.length < 0) {
          beam.y = height + beam.length;
          beam.x = Math.random() * width;
        }

        const gradient = ctx.createLinearGradient(
          beam.x,
          beam.y,
          beam.x + Math.sin(beam.angle) * beam.length,
          beam.y - Math.cos(beam.angle) * beam.length
        );

        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.5, lightColor);
        gradient.addColorStop(0.8, beamColor);
        gradient.addColorStop(1, "rgba(99, 102, 241, 0)");

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = beam.width;
        ctx.globalAlpha = beam.opacity;
        ctx.moveTo(beam.x, beam.y);
        ctx.lineTo(
          beam.x + Math.sin(beam.angle) * beam.length,
          beam.y - Math.cos(beam.angle) * beam.length
        );
        ctx.stroke();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [beamWidth, beamHeight, beamNumber, lightColor, beamColor, speed, noiseIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none opacity-60 ${className}`}
    />
  );
};
