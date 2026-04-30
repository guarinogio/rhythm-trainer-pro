import { useState } from "react";
import { Menu, X } from "lucide-react";
import { DIFFICULTIES, STUDY_MODES } from "../lib/rhythmCatalog.js";

export default function SessionControls({
  bpm,
  setBpm,
  volume,
  setVolume,
  backingEnabled,
  setBackingEnabled,
  backingVolume,
  setBackingVolume,
  countInEnabled,
  setCountInEnabled,
  metronomeEnabled,
  setMetronomeEnabled,
  drumsEnabled,
  setDrumsEnabled,
  drumsVolume,
  setDrumsVolume,
  bassEnabled,
  setBassEnabled,
  bassVolume,
  setBassVolume,
  backingStyle,
  setBackingStyle,
  studyMode,
  setStudyMode,
  difficulty,
  setDifficulty,
  practiceRepeats,
  setPracticeRepeats,
  disabled,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="hamburger-button" onClick={() => setOpen(true)} type="button">
        <Menu size={22} />
        Options
      </button>

      {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Close menu" />}

      <aside className={`settings-sidebar ${open ? "open" : ""}`}>
        <header className="sidebar-header">
          <div>
            <p className="kicker">Game Options</p>
            <h2>Rhythm setup</h2>
          </div>

          <button className="icon-button" onClick={() => setOpen(false)} type="button">
            <X size={22} />
          </button>
        </header>

        <div className="sidebar-section">
          <h3>Study</h3>

          <div className="menu-card">
            <label>BPM</label>
            <div className="inline-control">
              <input type="number" min="40" max="220" value={bpm} disabled={disabled} onChange={(e) => setBpm(Number(e.target.value))} />
              <input type="range" min="40" max="220" value={bpm} disabled={disabled} onChange={(e) => setBpm(Number(e.target.value))} />
            </div>
          </div>

          <div className="menu-card">
            <label>Study Mode</label>
            <div className="segmented">
              {Object.values(STUDY_MODES).map((mode) => (
                <button key={mode.id} disabled={disabled} className={studyMode === mode.id ? "active" : ""} onClick={() => setStudyMode(mode.id)}>
                  {mode.label}
                </button>
              ))}
            </div>
            <small>{STUDY_MODES[studyMode].description}</small>
          </div>

          <div className="menu-card">
            <label>Difficulty</label>
            <select value={difficulty} disabled={disabled} onChange={(e) => setDifficulty(e.target.value)}>
              {Object.values(DIFFICULTIES).map((level) => (
                <option key={level.id} value={level.id}>{level.label}</option>
              ))}
            </select>
            <small>{DIFFICULTIES[difficulty].description}</small>
          </div>

          <div className="menu-card">
            <label>Practice Loops</label>
            <div className="stepper compact-stepper">
              <button disabled={disabled || practiceRepeats <= 1} onClick={() => setPracticeRepeats(practiceRepeats - 1)}>−</button>
              <strong>{practiceRepeats}</strong>
              <button disabled={disabled || practiceRepeats >= 8} onClick={() => setPracticeRepeats(practiceRepeats + 1)}>+</button>
            </div>
            <small>How many practice rounds after each listen round.</small>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Music</h3>

          <div className="menu-card">
            <label>Style</label>
            <select value={backingStyle} disabled={disabled} onChange={(e) => setBackingStyle(e.target.value)}>
              <option value="jazz">Jazz</option>
              <option value="funk">Funk</option>
              <option value="rnb">R&B</option>
              <option value="rock">Rock</option>
            </select>
            <small>Changes piano, bass, and drum feel.</small>
          </div>

          <LayerCard label="Piano" enabled={backingEnabled} setEnabled={setBackingEnabled} value={backingVolume} onChange={setBackingVolume} disabled={disabled} />
          <LayerCard label="Drums" enabled={drumsEnabled} setEnabled={setDrumsEnabled} value={drumsVolume} onChange={setDrumsVolume} disabled={disabled} />
          <LayerCard label="Bass" enabled={bassEnabled} setEnabled={setBassEnabled} value={bassVolume} onChange={setBassVolume} disabled={disabled} />

          <div className="menu-card">
            <label>Main Volume</label>
            <div className="volume-row">
              <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
              <strong>{volume}%</strong>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Guides</h3>

          <ToggleCard label="Count-in" enabled={countInEnabled} setEnabled={setCountInEnabled} disabled={disabled} />
          <ToggleCard label="Metronome" enabled={metronomeEnabled} setEnabled={setMetronomeEnabled} disabled={disabled} />
        </div>
      </aside>
    </>
  );
}

function LayerCard({ label, enabled, setEnabled, value, onChange, disabled }) {
  return (
    <div className="menu-card">
      <label>{label}</label>
      <div className="backing-toggle">
        <button disabled={disabled} className={enabled ? "active" : ""} onClick={() => setEnabled(true)}>On</button>
        <button disabled={disabled} className={!enabled ? "active" : ""} onClick={() => setEnabled(false)}>Off</button>
      </div>
      <div className="volume-row">
        <input type="range" min="0" max="100" value={value} disabled={!enabled} onChange={(e) => onChange(Number(e.target.value))} />
        <strong>{value}%</strong>
      </div>
    </div>
  );
}

function ToggleCard({ label, enabled, setEnabled, disabled }) {
  return (
    <div className="menu-card">
      <label>{label}</label>
      <div className="backing-toggle">
        <button disabled={disabled} className={enabled ? "active" : ""} onClick={() => setEnabled(true)}>On</button>
        <button disabled={disabled} className={!enabled ? "active" : ""} onClick={() => setEnabled(false)}>Off</button>
      </div>
    </div>
  );
}
