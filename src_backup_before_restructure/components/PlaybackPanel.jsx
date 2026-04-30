import { Play, Square } from "lucide-react";

export default function PlaybackPanel({
  isPlaying,
  onDemo,
  onPractice,
  onStop,
}) {
  return (
    <section className="card playback-card">
      <div>
        <p className="section-kicker">Playback</p>
        <h2>Listen or perform</h2>
        <p>Demo plays the full rhythm. Practice keeps only the metronome.</p>
      </div>

      <div className="playback-actions">
        <button type="button" onClick={onDemo} disabled={isPlaying}>
          <Play size={18} />
          Demo
        </button>

        <button type="button" onClick={onPractice} disabled={isPlaying}>
          <Play size={18} />
          Practice
        </button>

        <button
          type="button"
          className="danger"
          onClick={onStop}
          disabled={!isPlaying}
        >
          <Square size={18} />
          Stop
        </button>
      </div>
    </section>
  );
}
