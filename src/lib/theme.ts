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
