import React from 'react';
import { getPatternStyle, PatternType } from '../utils/patterns';
interface PatternOverlayProps {
  pattern: PatternType;
  color?: string;
  opacity?: number;
  className?: string;
}
export function PatternOverlay({
  pattern,
  color = '#000',
  opacity = 0.05,
  className = ''
}: PatternOverlayProps) {
  const style = getPatternStyle(pattern, color, opacity);
  return <div className={`absolute inset-0 pointer-events-none z-0 ${className}`} style={style} aria-hidden="true" />;
}