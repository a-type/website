import create from 'zustand';
import { combine } from 'zustand/middleware';

type ColorTheme = {
  cloudWhite: string;
  cloudShadow1: string;
  cloudShadow2: string;
  ground: string;
};

export const day: ColorTheme = {
  cloudWhite: '#f0f0f8',
  cloudShadow1: '#d0deff',
  cloudShadow2: '#6457cb',
  ground: '#408eaf',
};

export const sunset: ColorTheme = {
  cloudWhite: '#f8b195',
  cloudShadow1: '#c06c84',
  cloudShadow2: '#3232a0',
  ground: '#626290',
};

export const sunrise: ColorTheme = {
  cloudWhite: '#ffe1a3',
  cloudShadow1: '#ffb183',
  cloudShadow2: '#c06c84',
  ground: '#ffbcd4',
};

export const withLabs: ColorTheme = {
  cloudWhite: '#f0ebe0',
  cloudShadow1: '#fd847e',
  cloudShadow2: '#dfddf9',
  ground: '#c7c3f4',
};

const themes = {
  day,
  sunset,
  sunrise,
  withLabs,
} as const;

export type ThemeName = keyof typeof themes;

export const useColors = create(
  combine(day, (set) => ({
    setTheme: (theme: keyof typeof themes) => set(themes[theme]),
  })),
);
