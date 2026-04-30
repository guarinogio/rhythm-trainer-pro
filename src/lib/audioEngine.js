import Soundfont from "soundfont-player";
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_SECONDS = 0.12;

const NOTE_FREQUENCIES = {
  C1: 32.7, D1: 36.71, E1: 41.2, F1: 43.65, G1: 49.0, A1: 55.0, B1: 61.74,
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25,
};

const PROGRESSIONS = [
  [
    { name: "C", notes: ["C3", "E3", "G3", "C4"], bassRoot: "C2", bassFifth: "G2", scale: ["C4", "D4", "E4", "G4", "A4", "C5"] },
    { name: "G", notes: ["G2", "D3", "G3", "B3"], bassRoot: "G1", bassFifth: "D2", scale: ["B3", "D4", "E4", "G4", "A4", "B4"] },
    { name: "Am", notes: ["A2", "E3", "A3", "C4"], bassRoot: "A1", bassFifth: "E2", scale: ["A3", "C4", "D4", "E4", "G4", "A4"] },
    { name: "F", notes: ["F2", "C3", "F3", "A3"], bassRoot: "F1", bassFifth: "C2", scale: ["A3", "C4", "D4", "F4", "G4", "A4"] },
  ],
  [
    { name: "Am", notes: ["A2", "E3", "A3", "C4"], bassRoot: "A1", bassFifth: "E2", scale: ["A3", "C4", "D4", "E4", "G4", "A4"] },
    { name: "F", notes: ["F2", "C3", "F3", "A3"], bassRoot: "F1", bassFifth: "C2", scale: ["A3", "C4", "D4", "F4", "G4", "A4"] },
    { name: "C", notes: ["C3", "E3", "G3", "C4"], bassRoot: "C2", bassFifth: "G2", scale: ["C4", "D4", "E4", "G4", "A4", "C5"] },
    { name: "G", notes: ["G2", "D3", "G3", "B3"], bassRoot: "G1", bassFifth: "D2", scale: ["B3", "D4", "E4", "G4", "A4", "B4"] },
  ],
];

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function choose(items, rand) {
  return items[Math.floor(rand() * items.length)];
}

function makeBackingPlan(pattern, bpm, dynamicSeed = "") {
  const seed = pattern.reduce((sum, cell, index) => {
    return sum + cell.id.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0) * (index + 1);
  }, bpm + String(dynamicSeed).split("").reduce((a, ch) => a + ch.charCodeAt(0), 0));

  const rand = seededRandom(seed);
  const progression = choose(PROGRESSIONS, rand);

  return pattern.map((_, beatIndex) => {
    const measureIndex = Math.floor(beatIndex / 4);
    const beatInMeasure = beatIndex % 4;
    const chord = progression[measureIndex % progression.length];

    return {
      beatIndex,
      beatInMeasure,
      chord,
      melodyNote: choose(chord.scale, rand),
      density: rand() > 0.55 ? "active" : "simple",
    };
  });
}

export class AudioEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.rhythmGain = null;
    this.backingGain = null;
    this.drumsGain = null;
    this.bassGain = null;

    this.schedulerId = null;
    this.events = [];
    this.nextEventIndex = 0;
    this.running = false;
    this.nodes = [];
    this.drumBuffers = {};
    this.pianoInstrument = null;
    this.bassInstrument = null;
    this.realInstrumentsLoaded = false;
  }

  async init(volume, backingVolume, drumsVolume, bassVolume) {
    if (!this.context || this.context.state === "closed") {
      this.context = new AudioContext();

      this.master = this.context.createGain();
      this.rhythmGain = this.context.createGain();
      this.backingGain = this.context.createGain();
      this.drumsGain = this.context.createGain();
      this.bassGain = this.context.createGain();

      this.rhythmGain.connect(this.master);
      this.backingGain.connect(this.master);
      this.drumsGain.connect(this.master);
      this.bassGain.connect(this.master);
      this.master.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.setMainVolume(volume);
    this.setBackingVolume(backingVolume);
    this.setDrumsVolume(drumsVolume);
    this.setBassVolume(bassVolume);

    await this.loadDrumSamples();
    await this.loadRealInstruments();
  }

  async loadRealInstruments() {
    if (this.realInstrumentsLoaded) return;

    try {
      const [piano, bass] = await Promise.all([
        Soundfont.instrument(this.context, "acoustic_grand_piano", {
          destination: this.backingGain,
          gain: 1,
        }),
        Soundfont.instrument(this.context, "electric_bass_finger", {
          destination: this.bassGain,
          gain: 1,
        }),
      ]);

      this.pianoInstrument = piano;
      this.bassInstrument = bass;
      this.realInstrumentsLoaded = true;
    } catch (error) {
      console.warn("SoundFont instruments could not be loaded. Falling back to synths.", error);
      this.realInstrumentsLoaded = false;
    }
  }

  async loadDrumSamples() {
    const samples = {
      kick: "/samples/909/kick.wav",
      snare: "/samples/909/snare.wav",
      hat: "/samples/909/hihat.wav",
    };

    await Promise.all(Object.entries(samples).map(async ([name, url]) => {
      if (this.drumBuffers[name]) return;

      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        this.drumBuffers[name] = await this.context.decodeAudioData(arrayBuffer);
      } catch {
        this.drumBuffers[name] = null;
      }
    }));
  }

  setMainVolume(volume) {
    if (!this.rhythmGain) return;
    this.rhythmGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume / 100)), this.context.currentTime, 0.01);
  }

  setBackingVolume(volume) {
    if (!this.backingGain) return;
    this.currentBackingVolume = Math.max(0, Math.min(0.8, volume / 100));
    this.backingGain.gain.setTargetAtTime(this.currentBackingVolume, this.context.currentTime, 0.01);
  }

  setDrumsVolume(volume) {
    if (!this.drumsGain) return;
    this.currentDrumsVolume = Math.max(0, Math.min(1, volume / 100));
    this.drumsGain.gain.setTargetAtTime(this.currentDrumsVolume, this.context.currentTime, 0.01);
  }

  setBassVolume(volume) {
    if (!this.bassGain) return;
    this.currentBassVolume = Math.max(0, Math.min(1, volume / 100));
    this.bassGain.gain.setTargetAtTime(this.currentBassVolume, this.context.currentTime, 0.01);
  }

  setMusicDucking(mode) {
    if (!this.context) return;

    const musicMultiplier = mode === "listen" ? 0.12 : 1;
    const now = this.context.currentTime;

    if (this.backingGain) {
      this.backingGain.gain.cancelScheduledValues(now);
      this.backingGain.gain.setTargetAtTime(this.currentBackingVolume * musicMultiplier, now, 0.035);
    }

    if (this.drumsGain) {
      this.drumsGain.gain.cancelScheduledValues(now);
      this.drumsGain.gain.setTargetAtTime(this.currentDrumsVolume * musicMultiplier, now, 0.035);
    }

    if (this.bassGain) {
      this.bassGain.gain.cancelScheduledValues(now);
      this.bassGain.gain.setTargetAtTime(this.currentBassVolume * musicMultiplier, now, 0.035);
    }
  }

  stop() {
    this.running = false;

    if (this.schedulerId) {
      clearInterval(this.schedulerId);
      this.schedulerId = null;
    }

    this.events = [];
    this.nextEventIndex = 0;

    this.nodes.forEach((node) => {
      try { node.stop(); } catch {}
    });

    this.nodes = [];
  }

  trackNode(node) {
    this.nodes.push(node);
    node.onended = () => {
      this.nodes = this.nodes.filter((item) => item !== node);
    };
  }

  envelope(time, duration, gain, target = null) {
    const amp = this.context.createGain();
    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), time + 0.006);
    if (target !== null) {
      amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, target), time + duration * 0.45);
    }
    amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    return amp;
  }

  playPulse(time, accent) {
    const osc = this.context.createOscillator();
    const amp = this.envelope(time, accent ? 0.04 : 0.028, accent ? 0.18 : 0.055);

    osc.type = "sine";
    osc.frequency.setValueAtTime(accent ? 880 : 660, time);

    osc.connect(amp);
    amp.connect(this.rhythmGain);

    osc.start(time);
    osc.stop(time + 0.06);
    this.trackNode(osc);
  }

  playPracticeGuide(time, accent = false) {
    const osc = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const amp = this.context.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(accent ? 1150 : 930, time);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(accent ? 1250 : 980, time);
    filter.Q.setValueAtTime(7.5, time);

    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(accent ? 0.42 : 0.3, time + 0.002);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.055);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(this.rhythmGain);

    osc.start(time);
    osc.stop(time + 0.07);

    this.trackNode(osc);
  }

  playClap(time, accent) {
    const osc = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const amp = this.context.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(accent ? 1850 : 1550, time);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(accent ? 2100 : 1750, time);
    filter.Q.setValueAtTime(10, time);

    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(accent ? 0.95 : 0.72, time + 0.002);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(this.rhythmGain);

    osc.start(time);
    osc.stop(time + 0.055);

    this.trackNode(osc);
  }

  playVoice(time, bpm, event) {
    const duration = Math.max(0.06, event.duration * (60 / bpm));
    const osc = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const amp = this.envelope(time, duration, 0.32 * (event.accent ?? 1), 0.16);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(duration > 0.35 ? 294 : 392, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1300, time);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(this.rhythmGain);

    osc.start(time);
    osc.stop(time + duration + 0.03);
    this.trackNode(osc);
  }

  playSample(name, time, gainValue = 1) {
    const buffer = this.drumBuffers[name];

    if (!buffer) {
      if (name === "kick") this.playSyntheticKick(time);
      if (name === "snare") this.playSyntheticSnare(time);
      if (name === "hat") this.playSyntheticHat(time);
      return;
    }

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();

    source.buffer = buffer;
    gain.gain.setValueAtTime(gainValue, time);

    source.connect(gain);
    gain.connect(this.drumsGain);

    source.start(time);
    this.trackNode(source);
  }

  playSyntheticKick(time) {
    const osc = this.context.createOscillator();
    const amp = this.envelope(time, 0.13, 0.9);
    osc.type = "sine";
    osc.frequency.setValueAtTime(145, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    osc.connect(amp);
    amp.connect(this.drumsGain);
    osc.start(time);
    osc.stop(time + 0.15);
    this.trackNode(osc);
  }

  playSyntheticSnare(time) {
    const bufferSize = Math.floor(this.context.sampleRate * 0.12);
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1;

    const noise = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const amp = this.envelope(time, 0.11, 0.45);

    noise.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.setValueAtTime(900, time);

    noise.connect(filter);
    filter.connect(amp);
    amp.connect(this.drumsGain);

    noise.start(time);
    noise.stop(time + 0.12);
    this.trackNode(noise);
  }

  playSyntheticHat(time) {
    const bufferSize = Math.floor(this.context.sampleRate * 0.05);
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1;

    const noise = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const amp = this.envelope(time, 0.045, 0.25);

    noise.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.setValueAtTime(5000, time);

    noise.connect(filter);
    filter.connect(amp);
    amp.connect(this.drumsGain);

    noise.start(time);
    noise.stop(time + 0.05);
    this.trackNode(noise);
  }

  playPianoNote(time, note, duration, gainValue = 0.045) {
    if (this.pianoInstrument) {
      this.pianoInstrument.play(note, time, {
        duration: Math.max(0.08, duration),
        gain: gainValue * 7.5,
      });
      return;
    }

    const frequency = NOTE_FREQUENCIES[note];
    if (!frequency) return;

    const osc = this.context.createOscillator();
    const amp = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2200, time);

    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(gainValue, time + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(this.backingGain);

    osc.start(time);
    osc.stop(time + duration + 0.05);
    this.trackNode(osc);
  }

  playPianoChord(time, chord, bpm) {
    const duration = (60 / bpm) * 1.85;
    chord.notes.forEach((note, index) => {
      this.playPianoNote(time + index * 0.014, note, duration, 0.042);
    });
  }

  playPianoArpeggio(time, chord, bpm, beatInMeasure, density) {
    const beatSeconds = 60 / bpm;
    const notes = chord.notes;
    this.playPianoNote(time, notes[beatInMeasure % notes.length], beatSeconds * 0.72, 0.034);

    if (density === "active") {
      this.playPianoNote(time + beatSeconds * 0.5, notes[(beatInMeasure + 2) % notes.length], beatSeconds * 0.5, 0.026);
    }
  }

  playPianoMelody(time, note, bpm) {
    this.playPianoNote(time + (60 / bpm) * 0.02, note, (60 / bpm) * 0.45, 0.034);
  }

  playBassNote(time, note, bpm, accent) {
    const duration = (60 / bpm) * 0.92;

    if (this.bassInstrument) {
      this.bassInstrument.play(note, time, {
        duration,
        gain: accent ? 1.15 : 0.88,
      });
      return;
    }

    const frequency = NOTE_FREQUENCIES[note];
    if (!frequency) return;

    const osc = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const amp = this.context.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(frequency, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(accent ? 620 : 420, time);

    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(accent ? 0.55 : 0.38, time + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(this.bassGain);

    osc.start(time);
    osc.stop(time + duration + 0.05);
    this.trackNode(osc);
  }

  buildEvents({
    pattern,
    bpm,
    mode,
    phaseSequence,
    studyMode,
    backingEnabled,
    countInEnabled,
    metronomeEnabled,
    drumsEnabled,
    bassEnabled,
    backingStyle,
    dynamicSeed = "",
    maxLoops = 1000,
    onComplete,
    onLoop,
    onCount,
    onBeat,
    onEndBeat,
  }) {
    const beatSeconds = 60 / bpm;
    const countBeats = countInEnabled ? 3 : 0;
    const cycleBeats = countBeats + pattern.length;
    const startAt = this.context.currentTime + 0.18;
    const backingPlan = makeBackingPlan(pattern, bpm, dynamicSeed);
    const events = [];

    const add = (time, type, payload = {}) => events.push({ time, type, payload });

    for (let loop = 0; loop < maxLoops; loop += 1) {
      const cycleStartBeat = loop * cycleBeats;
      const loopMode = Array.isArray(phaseSequence)
        ? phaseSequence[loop] ?? mode
        : mode;

      add(startAt + cycleStartBeat * beatSeconds, "loop", {
        loop: loop + 1,
        mode: loopMode,
      });

      if (countInEnabled) {
        for (let i = 0; i < 3; i += 1) {
          add(startAt + (cycleStartBeat + i) * beatSeconds, "count", { count: i + 1, accent: i === 0 });
        }
      }

      const patternStartBeat = cycleStartBeat + countBeats;

      pattern.forEach((cell, beatIndex) => {
        const beatTime = startAt + (patternStartBeat + beatIndex) * beatSeconds;
        const plan = backingPlan[(beatIndex + loop) % backingPlan.length];
        const beatInMeasure = beatIndex % 4;

        add(beatTime, "beat", { beatIndex });

        if ((loopMode === "listen" || loopMode === "practice") && metronomeEnabled) {
          add(beatTime, "pulse", { accent: beatInMeasure === 0 });
        }

        if (loopMode === "listen") {
          cell.events.forEach((event, subdivisionIndex) => {
            add(beatTime + event.at * beatSeconds, "rhythm", { beatIndex, subdivisionIndex, event, studyMode });
          });
        }

        if (drumsEnabled) {
          if (backingStyle === "rock") {
            if (beatInMeasure === 0 || beatInMeasure === 2) add(beatTime, "kick");
            if (beatInMeasure === 1 || beatInMeasure === 3) add(beatTime, "snare");
            add(beatTime, "hat");
            add(beatTime + beatSeconds * 0.5, "hat");
          }

          if (backingStyle === "funk") {
            if (beatInMeasure === 0) add(beatTime, "kick");
            if (beatInMeasure === 1 || beatInMeasure === 3) add(beatTime, "snare");
            if (beatInMeasure === 2) add(beatTime + beatSeconds * 0.5, "kick");
            add(beatTime, "hat");
            add(beatTime + beatSeconds * 0.5, "hat");
          }

          if (backingStyle === "rnb") {
            if (beatInMeasure === 0) add(beatTime, "kick");
            if (beatInMeasure === 2) add(beatTime + beatSeconds * 0.5, "kick");
            if (beatInMeasure === 1 || beatInMeasure === 3) add(beatTime, "snare");
            add(beatTime + beatSeconds * 0.5, "hat");
          }

          if (backingStyle === "jazz") {
            add(beatTime + beatSeconds * 0.5, "hat");
            if (beatInMeasure === 1 || beatInMeasure === 3) add(beatTime, "snare");
            if (beatInMeasure === 0) add(beatTime, "kick");
          }
        }

        if (backingEnabled && plan) {
          if (beatInMeasure === 0) add(beatTime, "pianoChord", { chord: plan.chord });
          if (beatInMeasure % 2 === 0) add(beatTime, "pianoArpeggio", { chord: plan.chord, beatInMeasure, density: plan.density });
          if (beatInMeasure === 1 || beatInMeasure === 3) add(beatTime, "pianoMelody", { note: plan.melodyNote });
        }

        if (bassEnabled && plan) {
          if (backingStyle === "rock") {
            if (beatInMeasure === 0) add(beatTime, "bass", { note: plan.chord.bassRoot, accent: true });
            if (beatInMeasure === 2) add(beatTime, "bass", { note: plan.chord.bassFifth, accent: false });
          }

          if (backingStyle === "funk") {
            if (beatInMeasure === 0) add(beatTime, "bass", { note: plan.chord.bassRoot, accent: true });
            if (beatInMeasure === 1) add(beatTime + beatSeconds * 0.5, "bass", { note: plan.chord.bassFifth, accent: false });
            if (beatInMeasure === 2) add(beatTime, "bass", { note: plan.chord.bassRoot, accent: false });
            if (beatInMeasure === 3) add(beatTime + beatSeconds * 0.5, "bass", { note: plan.chord.bassFifth, accent: false });
          }

          if (backingStyle === "rnb") {
            if (beatInMeasure === 0) add(beatTime, "bass", { note: plan.chord.bassRoot, accent: true });
            if (beatInMeasure === 2) add(beatTime + beatSeconds * 0.5, "bass", { note: plan.chord.bassFifth, accent: false });
          }

          if (backingStyle === "jazz") {
            add(beatTime, "bass", {
              note: beatInMeasure % 2 === 0 ? plan.chord.bassRoot : plan.chord.bassFifth,
              accent: beatInMeasure === 0,
            });
          }
        }

        add(beatTime + beatSeconds, "endBeat");
      });
    }

    add(startAt + maxLoops * cycleBeats * beatSeconds, "complete");

    events.sort((a, b) => a.time - b.time);

    return events.map((event) => ({
      ...event,
      callback: () => {
        if (event.type === "loop") {
          this.setMusicDucking(event.payload.mode);
          onLoop(event.payload.loop, event.payload.mode);
        }

        if (event.type === "count") {
          this.playPulse(event.time, event.payload.accent);
          onCount(event.payload.count);
          onBeat({ beatIndex: null, subdivisionIndex: null });
        }

        if (event.type === "beat") {
          onCount(null);
          onBeat({ beatIndex: event.payload.beatIndex, subdivisionIndex: null });
        }

        if (event.type === "pulse") this.playPulse(event.time, event.payload.accent);

        if (event.type === "rhythm") {
          const { event: rhythmEvent, studyMode, beatIndex, subdivisionIndex } = event.payload;
          if (studyMode === "voice") this.playVoice(event.time, bpm, rhythmEvent);
          else this.playClap(event.time, true);
          onBeat({ beatIndex, subdivisionIndex });
        }

        if (event.type === "kick") this.playSample("kick", event.time, 1);
        if (event.type === "snare") this.playSample("snare", event.time, 0.9);
        if (event.type === "hat") this.playSample("hat", event.time, 0.7);

        if (event.type === "pianoChord") this.playPianoChord(event.time, event.payload.chord, bpm);
        if (event.type === "pianoArpeggio") this.playPianoArpeggio(event.time, event.payload.chord, bpm, event.payload.beatInMeasure, event.payload.density);
        if (event.type === "pianoMelody") this.playPianoMelody(event.time, event.payload.note, bpm);

        if (event.type === "bass") this.playBassNote(event.time, event.payload.note, bpm, event.payload.accent);

        if (event.type === "endBeat") onEndBeat();

        if (event.type === "complete") {
          this.stop();
          onComplete?.();
        }
      },
    }));
  }

  startScheduler() {
    this.schedulerId = setInterval(() => {
      if (!this.running || !this.context) return;

      const horizon = this.context.currentTime + SCHEDULE_AHEAD_SECONDS;

      while (this.nextEventIndex < this.events.length && this.events[this.nextEventIndex].time <= horizon) {
        const event = this.events[this.nextEventIndex];
        event.callback();
        this.nextEventIndex += 1;
      }
    }, LOOKAHEAD_MS);
  }


  async startGameSession(config) {
    this.stop();

    await this.init(
      config.volume,
      config.backingVolume,
      config.drumsVolume,
      config.bassVolume
    );

    const {
      blocks,
      bpm,
      studyMode,
      backingEnabled,
      countInEnabled,
      metronomeEnabled,
      drumsEnabled,
      bassEnabled,
      backingStyle,
      practiceRepeats,
      dynamicSeed = "",
      onBlock,
      onLoop,
      onCount,
      onBeat,
      onEndBeat,
      onComplete,
    } = config;

    const beatSeconds = 60 / bpm;
    const countBeats = countInEnabled ? 3 : 0;
    const roundsPerBlock = 1 + practiceRepeats;
    const startAt = this.context.currentTime + 0.18;
    const events = [];

    const add = (time, type, payload = {}) => events.push({ time, type, payload });

    let cursorBeat = 0;

    blocks.forEach((pattern, blockIndex) => {
      const blockNumber = blockIndex + 1;
      const blockStartTime = startAt + cursorBeat * beatSeconds;

      add(blockStartTime, "block", { blockNumber, pattern });

      const backingPlan = makeBackingPlan(
        pattern,
        bpm,
        `${dynamicSeed}-${blockNumber}`
      );

      for (let roundIndex = 0; roundIndex < roundsPerBlock; roundIndex += 1) {
        const loopMode = roundIndex === 0 ? "listen" : "practice";
        const roundNumber = loopMode === "practice" ? roundIndex : 1;
        const roundStartBeat = cursorBeat + roundIndex * (countBeats + pattern.length);

        add(startAt + roundStartBeat * beatSeconds, "loop", {
          loop: roundNumber,
          mode: loopMode,
          blockNumber,
        });

        if (countInEnabled) {
          for (let i = 0; i < 3; i += 1) {
            add(startAt + (roundStartBeat + i) * beatSeconds, "count", {
              count: i + 1,
              accent: i === 0,
            });
          }
        }

        const patternStartBeat = roundStartBeat + countBeats;

        pattern.forEach((cell, beatIndex) => {
          const beatTime = startAt + (patternStartBeat + beatIndex) * beatSeconds;
          const beatInMeasure = beatIndex % 4;
          const plan = backingPlan[(beatIndex + roundIndex) % backingPlan.length];

          add(beatTime, "beat", { beatIndex });

          if (metronomeEnabled) {
            add(beatTime, "pulse", { accent: beatInMeasure === 0 });
          }

          if (loopMode === "listen" || loopMode === "practice") {
            cell.events.forEach((event, subdivisionIndex) => {
              add(beatTime + event.at * beatSeconds, loopMode === "listen" ? "rhythm" : "practiceGuide", {
                beatIndex,
                subdivisionIndex,
                event,
                studyMode,
              });
            });
          }

          if (drumsEnabled) {
            if (backingStyle === "rock") {
              if (beatInMeasure === 0 || beatInMeasure === 2) add(beatTime, "kick");
              if (beatInMeasure === 1 || beatInMeasure === 3) add(beatTime, "snare");
              add(beatTime, "hat");
              add(beatTime + beatSeconds * 0.5, "hat");
            }

            if (backingStyle === "funk") {
              if (beatInMeasure === 0) add(beatTime, "kick");
              if (beatInMeasure === 1 || beatInMeasure === 3) add(beatTime, "snare");
              if (beatInMeasure === 2) add(beatTime + beatSeconds * 0.5, "kick");
              add(beatTime, "hat");
              add(beatTime + beatSeconds * 0.5, "hat");
            }

            if (backingStyle === "rnb") {
              if (beatInMeasure === 0) add(beatTime, "kick");
              if (beatInMeasure === 2) add(beatTime + beatSeconds * 0.5, "kick");
              if (beatInMeasure === 1 || beatInMeasure === 3) add(beatTime, "snare");
              add(beatTime + beatSeconds * 0.5, "hat");
            }

            if (backingStyle === "jazz") {
              add(beatTime + beatSeconds * 0.5, "hat");
              if (beatInMeasure === 1 || beatInMeasure === 3) add(beatTime, "snare");
              if (beatInMeasure === 0) add(beatTime, "kick");
            }
          }

          if (backingEnabled && plan) {
            if (beatInMeasure === 0) add(beatTime, "pianoChord", { chord: plan.chord });
            if (beatInMeasure % 2 === 0) add(beatTime, "pianoArpeggio", { chord: plan.chord, beatInMeasure, density: plan.density });
            if (beatInMeasure === 1 || beatInMeasure === 3) add(beatTime, "pianoMelody", { note: plan.melodyNote });
          }

          if (bassEnabled && plan) {
            if (backingStyle === "jazz") {
              add(beatTime, "bass", {
                note: beatInMeasure % 2 === 0 ? plan.chord.bassRoot : plan.chord.bassFifth,
                accent: beatInMeasure === 0,
              });
            } else {
              if (beatInMeasure === 0) add(beatTime, "bass", { note: plan.chord.bassRoot, accent: true });
              if (beatInMeasure === 2) add(beatTime, "bass", { note: plan.chord.bassFifth, accent: false });
              if (backingStyle === "funk" && beatInMeasure === 3) {
                add(beatTime + beatSeconds * 0.5, "bass", { note: plan.chord.bassRoot, accent: false });
              }
            }
          }

          add(beatTime + beatSeconds, "endBeat");
        });
      }

      cursorBeat += roundsPerBlock * (countBeats + pattern.length);
    });

    add(startAt + cursorBeat * beatSeconds, "complete");

    events.sort((a, b) => a.time - b.time);

    this.events = events.map((event) => ({
      ...event,
      callback: () => {
        if (event.type === "block") onBlock?.(event.payload);

        if (event.type === "loop") {
          this.setMusicDucking(event.payload.mode);
          onLoop?.(event.payload.loop, event.payload.mode, event.payload.blockNumber);
        }

        if (event.type === "count") {
          this.playPulse(event.time, event.payload.accent);
          onCount?.(event.payload.count);
          onBeat?.({ beatIndex: null, subdivisionIndex: null });
        }

        if (event.type === "beat") {
          onCount?.(null);
          onBeat?.({ beatIndex: event.payload.beatIndex, subdivisionIndex: null });
        }

        if (event.type === "pulse") this.playPulse(event.time, event.payload.accent);

        if (event.type === "rhythm") {
          const { event: rhythmEvent, studyMode, beatIndex, subdivisionIndex } = event.payload;
          if (studyMode === "voice") this.playVoice(event.time, bpm, rhythmEvent);
          else this.playClap(event.time, true);
          onBeat?.({ beatIndex, subdivisionIndex });
        }

        if (event.type === "kick") this.playSample("kick", event.time, 1);
        if (event.type === "snare") this.playSample("snare", event.time, 0.9);
        if (event.type === "hat") this.playSample("hat", event.time, 0.7);

        if (event.type === "pianoChord") this.playPianoChord(event.time, event.payload.chord, bpm);
        if (event.type === "pianoArpeggio") this.playPianoArpeggio(event.time, event.payload.chord, bpm, event.payload.beatInMeasure, event.payload.density);
        if (event.type === "pianoMelody") this.playPianoMelody(event.time, event.payload.note, bpm);
        if (event.type === "bass") this.playBassNote(event.time, event.payload.note, bpm, event.payload.accent);

        if (event.type === "endBeat") onEndBeat?.();

        if (event.type === "complete") {
          this.stop();
          onComplete?.();
        }
      },
    }));

    this.running = true;
    this.nextEventIndex = 0;
    this.startScheduler();
  }


  async start(config) {
    this.stop();

    await this.init(
      config.volume,
      config.backingVolume,
      config.drumsVolume,
      config.bassVolume
    );

    this.running = true;
    this.events = this.buildEvents(config);
    this.nextEventIndex = 0;
    this.startScheduler();
  }
}
