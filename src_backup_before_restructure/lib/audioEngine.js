export class RhythmAudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.timers = [];
    this.activeNodes = [];
    this.isRunning = false;
    this.volume = 0.75;
  }

  async init(volumePercent = 75) {
    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.setVolume(volumePercent);
  }

  setVolume(volumePercent) {
    this.volume = Math.max(0, Math.min(1, volumePercent / 100));

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.audioContext.currentTime,
        0.01
      );
    }
  }

  stop() {
    this.isRunning = false;

    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers = [];

    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // Node may already be stopped.
      }
    });

    this.activeNodes = [];
  }

  scheduleTimer(delayMs, callback) {
    const timer = window.setTimeout(() => {
      if (this.isRunning) callback();
    }, Math.max(0, delayMs));

    this.timers.push(timer);
    return timer;
  }

  scheduleAt(audioTime, callback) {
    const now = this.audioContext.currentTime;
    const delayMs = Math.max(0, (audioTime - now) * 1000);

    this.scheduleTimer(delayMs, () => {
      if (!this.isRunning) return;
      callback(audioTime);
    });
  }

  playTone({ time, frequency, duration, gain = 0.7, type = "sine" }) {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const amp = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, time);

    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), time + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(amp);
    amp.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.03);

    this.activeNodes.push(osc);

    osc.onended = () => {
      this.activeNodes = this.activeNodes.filter((node) => node !== osc);
    };
  }

  playClick(time, isAccent) {
    this.playTone({
      time,
      frequency: isAccent ? 1200 : 850,
      duration: isAccent ? 0.055 : 0.04,
      gain: isAccent ? 0.42 : 0.26,
      type: "square",
    });
  }

  playHit(time, bpm, event, studyMode) {
    const secondsPerBeat = 60 / bpm;
    const duration = Math.max(0.045, event.duration * secondsPerBeat);
    const isLong = studyMode === "voice" && event.duration >= 1;

    this.playTone({
      time,
      frequency: isLong ? 330 : 520,
      duration,
      gain: 0.45 * (event.accent ?? 1),
      type: isLong ? "triangle" : "sine",
    });
  }

  async startLoop({
    pattern,
    bpm,
    volume,
    mode,
    studyMode,
    onVisual,
    onCount,
    onLoop,
  }) {
    this.stop();
    await this.init(volume);

    this.isRunning = true;

    const secondsPerBeat = 60 / bpm;
    const totalBeats = pattern.reduce((sum, item) => sum + item.beats, 0);
    const cycleBeats = 3 + totalBeats;
    const startAt = this.audioContext.currentTime + 0.12;

    const scheduleCycle = (loopNumber, cycleStartBeat) => {
      if (!this.isRunning) return;

      onLoop(loopNumber);

      for (let i = 0; i < 3; i += 1) {
        const audioTime = startAt + (cycleStartBeat + i) * secondsPerBeat;

        this.scheduleAt(audioTime, (time) => {
          this.playClick(time, i === 0);
          onCount(i + 1);
          onVisual({ index: null, progress: 0 });
        });
      }

      const patternStartBeat = cycleStartBeat + 3;
      let cursor = 0;

      pattern.forEach((item, index) => {
        const cellStartBeat = patternStartBeat + cursor;

        for (let beat = 0; beat < item.beats; beat += 1) {
          const beatPosition = cursor + beat;
          const audioTime =
            startAt + (patternStartBeat + beatPosition) * secondsPerBeat;

          this.scheduleAt(audioTime, (time) => {
            this.playClick(time, beatPosition % 4 === 0);
            onCount(null);
            onVisual({
              index,
              progress: item.beats <= 1 ? 0 : beat / item.beats,
            });
          });
        }

        if (mode === "demo") {
          item.events.forEach((event) => {
            const audioTime =
              startAt + (cellStartBeat + event.at) * secondsPerBeat;

            this.scheduleAt(audioTime, (time) => {
              this.playHit(time, bpm, event, studyMode);
            });
          });
        }

        const endTime = startAt + (cellStartBeat + item.beats) * secondsPerBeat;

        this.scheduleAt(endTime, () => {
          onVisual({ index, progress: 1 });
        });

        cursor += item.beats;
      });

      const nextCycleBeat = cycleStartBeat + cycleBeats;
      const nextCycleTime = startAt + nextCycleBeat * secondsPerBeat;

      this.scheduleAt(nextCycleTime, () => {
        onCount(null);
        onVisual({ index: null, progress: 0 });
        scheduleCycle(loopNumber + 1, nextCycleBeat);
      });
    };

    scheduleCycle(1, 0);
  }
}
