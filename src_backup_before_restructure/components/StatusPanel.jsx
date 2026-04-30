export default function StatusPanel({
  phase,
  loop,
  count,
  soundRule,
  patternLength,
  studyMode,
  difficultyLabel,
}) {
  return (
    <section className="card status-card">
      <div>
        <span>Current Phase</span>
        <strong>{phase}</strong>
      </div>

      <div>
        <span>Loop</span>
        <strong>{loop || "—"}</strong>
      </div>

      <div>
        <span>Count</span>
        <strong>{count || "—"}</strong>
      </div>

      <div>
        <span>Sound Rule</span>
        <strong>{soundRule}</strong>
      </div>

      <div>
        <span>Pattern</span>
        <strong>
          {patternLength} beats · {studyMode} · {difficultyLabel}
        </strong>
      </div>
    </section>
  );
}
