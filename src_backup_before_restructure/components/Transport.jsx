import { Play, Square } from 'lucide-react';

export function Transport({ onDemo, onPractice, onStop, status }) {
  const isRunning = status !== 'idle';

  return (
    <section className="panel transport-panel" aria-labelledby="playback-title">
      <div>
        <h2 id="playback-title">Playback</h2>
        <p><strong>Demo</strong> plays the full rhythm. <strong>Practice</strong> keeps only the metronome.</p>
      </div>
      <div className="transport-buttons">
        <button onClick={onDemo} disabled={isRunning}><Play size={18} /> Demo</button>
        <button onClick={onPractice} disabled={isRunning}><Play size={18} /> Practice</button>
        <button className="danger" onClick={onStop} disabled={!isRunning}><Square size={18} /> Stop</button>
      </div>
    </section>
  );
}
