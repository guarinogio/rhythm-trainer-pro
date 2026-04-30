export default function StudyStatus({
  status,
  loop,
  count,
  length,
  bpm,
  studyMode,
  difficultyLabel,
}) {
  return (
    <section className="panel status-panel">
      <div>
        <span>Phase</span>
        <strong>{status === "idle" ? "Ready" : status === "listen" ? "Listen" : "Practice"}</strong>
      </div>
      <div>
        <span>Loop</span>
        <strong>{loop ?? "—"}</strong>
      </div>
      <div>
        <span>Count</span>
        <strong>{count ?? "—"}</strong>
      </div>
      <div>
        <span>Tempo</span>
        <strong>{bpm} BPM</strong>
      </div>
      <div>
        <span>Pattern</span>
        <strong>{length} beats · {studyMode} · {difficultyLabel}</strong>
      </div>
    </section>
  );
}
