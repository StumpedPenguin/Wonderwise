// Maps a child's chosen color to a cool-toned gradient used across screens.
export const childGradient: Record<string, string> = {
  sky: "from-sky-400 to-blue-500",
  violet: "from-violet-400 to-fuchsia-500",
  teal: "from-teal-400 to-emerald-500",
  indigo: "from-indigo-400 to-sky-500",
};

export function gradientFor(color: string): string {
  return childGradient[color] ?? childGradient.sky;
}

// Accent classes per game color. Written as full literal class strings so
// Tailwind's content scanner includes them.
export interface Accent {
  text: string;
  ring: string;
  soft: string;
  solid: string;
  grad: string;
}

export const gameAccent: Record<string, Accent> = {
  sky: {
    text: "text-sky-600",
    ring: "ring-sky-200",
    soft: "bg-sky-100",
    solid: "bg-sky-500",
    grad: "from-sky-400 to-blue-500",
  },
  teal: {
    text: "text-teal-600",
    ring: "ring-teal-200",
    soft: "bg-teal-100",
    solid: "bg-teal-500",
    grad: "from-teal-400 to-emerald-500",
  },
  indigo: {
    text: "text-indigo-600",
    ring: "ring-indigo-200",
    soft: "bg-indigo-100",
    solid: "bg-indigo-500",
    grad: "from-indigo-400 to-sky-500",
  },
  violet: {
    text: "text-violet-600",
    ring: "ring-violet-200",
    soft: "bg-violet-100",
    solid: "bg-violet-500",
    grad: "from-violet-400 to-fuchsia-500",
  },
};

export function accentFor(color: string): Accent {
  return gameAccent[color] ?? gameAccent.sky;
}
