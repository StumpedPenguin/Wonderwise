// Shared text-to-speech helper. Picks a friendlier English voice when the
// browser offers one, and degrades silently if speech isn't available.

let preferred: SpeechSynthesisVoice | null = null;
let initialized = false;

function pickVoice(): SpeechSynthesisVoice | null {
  try {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const prefs = [
      /samantha/i,
      /google us english/i,
      /google uk english female/i,
      /(zira|jenny|aria)/i,
      /female/i,
    ];
    for (const re of prefs) {
      const v = voices.find((x) => re.test(x.name));
      if (v) return v;
    }
    return voices.find((x) => x.lang?.toLowerCase().startsWith("en")) ?? voices[0];
  } catch {
    return null;
  }
}

function ensureInit() {
  if (initialized || typeof window === "undefined" || !window.speechSynthesis) return;
  initialized = true;
  preferred = pickVoice();
  // Voices often load asynchronously.
  window.speechSynthesis.onvoiceschanged = () => {
    preferred = pickVoice();
  };
}

export function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    ensureInit();
    if (!preferred) preferred = pickVoice();
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.12;
    if (preferred) u.voice = preferred;
    synth.speak(u);
  } catch {
    /* speech is a nice-to-have */
  }
}
