export function StatusBar({ status, loop, count, totalBeats, studyMode, difficulty }) {
  const statusText = status === 'idle' ? 'Ready' : status === 'demo' ? 'Demo: listen' : 'Practice: you perform';
  const soundRule = status === 'idle' ? 'Waiting' : status === 'demo' ? 'Full rhythm + metronome' : 'Metronome only';

  return (
    <section className="panel status-panel">
      <div>
        <span>Current Phase</span>
        <strong>{statusText}</strong>
      </div>
      <div>
        <span>Loop</span>
        <strong>{status === 'idle' ? '—' : loop}</strong>
      </div>
      <div>
        <span>Count</span>
        <strong>{count ?? '—'}</strong>
      </div>
      <div>
        <span>Sound Rule</span>
        <strong>{soundRule}</strong>
      </div>
      <div>
        <span>Pattern</span>
        <strong>{totalBeats} beat-units · {studyMode} · {difficulty}</strong>
      </div>
    </section>
  );
}
