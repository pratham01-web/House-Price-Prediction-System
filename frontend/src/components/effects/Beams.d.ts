import React from 'react';

export interface BeamsProps {
  beamWidth?: number;
  beamHeight?: number;
  beamNumber?: number;
  lightColor?: string;
  beamColor?: string;
  backgroundColor?: string;
  speed?: number;
  noiseIntensity?: number;
  scale?: number;
  rotation?: number;
}

export declare const Beams: React.ForwardRefExoticComponent<BeamsProps & React.RefAttributes<any>>;
export default Beams;
