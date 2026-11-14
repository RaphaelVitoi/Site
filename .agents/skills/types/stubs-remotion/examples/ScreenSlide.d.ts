import type * as React from 'react';

export interface ScreenSlideProps {
  imageSrc: string;
  title: string;
  description?: string;
  width?: number;
  height?: number;
}

export const ScreenSlide: React.FC<ScreenSlideProps>;
