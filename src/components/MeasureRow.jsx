import BeatCell from "./BeatCell.jsx";

export default function MeasureRow({
  measure,
  measureIndex,
  studyMode,
  activeBeat,
  activeSubdivision,
}) {
  return (
    <div className="measure-row no-measure-label">
      <div className="beats-row">
        {measure.map((cell) => (
          <BeatCell
            key={cell.beatIndex}
            cell={cell}
            studyMode={studyMode}
            active={activeBeat === cell.beatIndex}
            activeSubdivision={activeBeat === cell.beatIndex ? activeSubdivision : null}
          />
        ))}
      </div>
    </div>
  );
}
