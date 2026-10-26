import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface Props {
  size?: number;
}

// A stylized mark echoing the source app's branding: a circuit-like tree
// (health + technology) with a geometric mandala woven into the canopy
// (the "Mantra" half of the name).
export function Logo({ size = 64 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E3F6F6" strokeWidth="2" />

      {/* trunk + circuit branches */}
      <Line x1="50" y1="88" x2="50" y2="62" stroke="#D98A3D" strokeWidth="4" strokeLinecap="round" />
      <Line x1="50" y1="72" x2="32" y2="58" stroke="#D98A3D" strokeWidth="3" strokeLinecap="round" />
      <Line x1="50" y1="72" x2="68" y2="58" stroke="#D98A3D" strokeWidth="3" strokeLinecap="round" />
      <Line x1="32" y1="58" x2="20" y2="46" stroke="#D98A3D" strokeWidth="3" strokeLinecap="round" />
      <Line x1="68" y1="58" x2="80" y2="46" stroke="#D98A3D" strokeWidth="3" strokeLinecap="round" />
      <Circle cx="20" cy="46" r="3.5" fill="#D98A3D" />
      <Circle cx="80" cy="46" r="3.5" fill="#D98A3D" />
      <Circle cx="32" cy="58" r="3" fill="#D98A3D" />
      <Circle cx="68" cy="58" r="3" fill="#D98A3D" />

      {/* yantra / mandala canopy */}
      <Circle cx="50" cy="38" r="22" fill="none" stroke="#1AA6A6" strokeWidth="2.5" />
      <Path d="M50 20 L66 48 L34 48 Z" fill="none" stroke="#1AA6A6" strokeWidth="2.2" />
      <Path d="M50 56 L34 28 L66 28 Z" fill="none" stroke="#1AA6A6" strokeWidth="2.2" />
      <Circle cx="50" cy="38" r="4" fill="#1AA6A6" />
    </Svg>
  );
}
