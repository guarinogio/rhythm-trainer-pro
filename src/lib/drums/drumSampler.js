import * as Tone from "tone";

let sampler;
let output;

export async function initDrumSampler(volume = 0.6) {
  await Tone.start();

  if (!output) {
    output = new Tone.Gain(volume).toDestination();
  }

  if (!sampler) {
    sampler = new Tone.Sampler({
      urls: {
        C1: "kick.wav",
        D1: "snare.wav",
        E1: "hihat.wav",
      },
      baseUrl: "/samples/909/",
      onload: () => {
        // listo
      },
    }).connect(output);
  }

  setDrumVolume(volume);
  return sampler;
}

export function setDrumVolume(volPercent) {
  if (!output) return;
  const v = Math.max(0, Math.min(1, volPercent / 100));
  output.gain.rampTo(v, 0.02);
}

export function triggerKick(time) {
  sampler?.triggerAttack("C1", time, 1);
}

export function triggerSnare(time) {
  sampler?.triggerAttack("D1", time, 0.9);
}

export function triggerHat(time) {
  sampler?.triggerAttack("E1", time, 0.6);
}
