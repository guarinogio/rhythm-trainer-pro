import MeasureRow from "./MeasureRow.jsx";

export default function TimelinePattern({
  measures,
  studyMode,
  activeBeat,
  activeSubdivision,
  gameMode = false,
}) {
  return (
    <section className={gameMode ? "pattern-panel game-pattern-panel" : "panel pattern-panel clean-pattern-panel"}>
      <div className="timeline">
        {measures.map((measure, measureIndex) => (
          <MeasureRow
            key={measureIndex}
            measure={measure}
            measureIndex={measureIndex}
            studyMode={studyMode}
            activeBeat={activeBeat}
            activeSubdivision={activeSubdivision}
          />
        ))}
      </div>
    </section>
  );
}
