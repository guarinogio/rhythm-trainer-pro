import { Shuffle } from "lucide-react";

const STUDY_MODES = [
  {
    value: "clapping",
    label: "Clapping",
    helper: "Short, percussive rhythms.",
  },
  {
    value: "voice",
    label: "Voice / Ta",
    helper: "Sung syllables and sustained sounds.",
  },
];

const DIFFICULTIES = [
  { id: "basic", label: "Basic", description: "Quarters, rests, and eighths." },
  { id: "developing", label: "Developing", description: "Adds sixteenths and simple patterns." },
  { id: "intermediate", label: "Intermediate", description: "Adds triplets and dotted figures." },
  { id: "advanced", label: "Advanced", description: "More complex study patterns." },
];

export default function SessionSetup({
  bpm,
  setBpm,
  length,
  setLength,
  volume,
  setVolume,
  studyMode,
  setStudyMode,
  difficulty,
  setDifficulty,
  disabled = false,
  onRandomize,
}) {
  const selectedMode = STUDY_MODES.find((m) => m.value === studyMode);
  const selectedDifficulty = DIFFICULTIES.find((d) => d.id === difficulty);

  return (
    <section className="session-panel">
      <div className="session-top">
        <div>
          <p className="kicker">Session Setup</p>
          <h2>Build a rhythm exercise</h2>
          <p>Choose the study target. The pattern is generated automatically.</p>
        </div>

        <button className="generate-button" onClick={onRandomize} disabled={disabled}>
          <Shuffle size={18} />
          Generate Pattern
        </button>
      </div>

      <div className="setup-layout">
        <div className="control-card wide">
          <label>BPM</label>
          <div className="bpm-control">
            <input
              type="number"
              min="40"
              max="220"
              value={bpm}
              disabled={disabled}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
            <input
              type="range"
              min="40"
              max="220"
              value={bpm}
              disabled={disabled}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </div>
          <small>Tempo for the metronome and rhythm.</small>
        </div>

        <div className="control-card">
          <label>Length</label>
          <div className="length-control">
            <button disabled={disabled || length <= 1} onClick={() => setLength(length - 1)}>
              −
            </button>
            <strong>{length}</strong>
            <button disabled={disabled || length >= 40} onClick={() => setLength(length + 1)}>
              +
            </button>
          </div>
          <small>1–40 beat-units. Rows wrap every 4 beats.</small>
        </div>

        <div className="control-card">
          <label>Study Mode</label>
          <div className="mode-toggle">
            {STUDY_MODES.map((mode) => (
              <button
                key={mode.value}
                disabled={disabled}
                className={studyMode === mode.value ? "active" : ""}
                onClick={() => setStudyMode(mode.value)}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <small>{selectedMode?.helper}</small>
        </div>

        <div className="control-card">
          <label>Difficulty</label>
          <select
            value={difficulty}
            disabled={disabled}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {DIFFICULTIES.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
          <small>{selectedDifficulty?.description}</small>
        </div>

        <div className="control-card">
          <label>Volume</label>
          <div className="volume-control">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
            <strong>{volume}%</strong>
          </div>
          <small>Audio output level.</small>
        </div>
      </div>
    </section>
  );
}
