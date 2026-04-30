export function generateBassNote(rootMidi, step) {
  // simple groove basado en 4/4
  const pattern = [
    rootMidi,         // 1
    null,             // &
    rootMidi + 7,     // 3 (quinta)
    null
  ];

  return pattern[step % 4];
}
