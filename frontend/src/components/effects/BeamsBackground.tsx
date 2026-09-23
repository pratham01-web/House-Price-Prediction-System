"use client";

import React, { Component, ReactNode, useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Beams = dynamic<any>(
  () => (import("./Beams") as unknown as Promise<React.ComponentType<any>>),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black pointer-events-none" />,
  }
);

class BeamsErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("WebGL / Three.js Beams unavailable, falling back to black background:", error);
  }

  render() {
    if (this.state.hasError) {
      return <div className="absolute inset-0 bg-black pointer-events-none" />;
    }
    return this.props.children;
  }
}

interface BeamsBackgroundProps {
  className?: string;
  beamWidth?: number;
  beamHeight?: number;
  beamNumber?: number;
  lightColor?: string;
  speed?: number;
  noiseIntensity?: number;
  scale?: number;
  rotation?: number;
}

export const BeamsBackground: React.FC<BeamsBackgroundProps> = ({
  className = "",
  beamWidth = 2,
  beamHeight = 15,
  beamNumber = 12,
  lightColor = "#ffffff",
  speed = 2,
  noiseIntensity = 1.75,
  scale = 0.2,
  rotation = 0,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 bg-black pointer-events-none z-0" />;
  }

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 bg-black ${className}`}>
      <BeamsErrorBoundary>
        <div className="w-full h-full opacity-65">
          <Beams
            beamWidth={beamWidth}
            beamHeight={beamHeight}
            beamNumber={beamNumber}
            lightColor={lightColor}
            beamColor="#000000"
            backgroundColor="#000000"
            speed={speed}
            noiseIntensity={noiseIntensity}
            scale={scale}
            rotation={rotation}
          />
        </div>
      </BeamsErrorBoundary>
      {/* Subtle radial gradient overlay to ensure full readability of content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60 pointer-events-none" />
    </div>
  );
};

export default BeamsBackground;
