export default function BeatCell({ cell, studyMode, active, activeSubdivision }) {
  const text = studyMode === "voice" ? cell.voiceText : cell.clappingText;

  return (
    <article className={`beat-cell ${active ? "active" : ""}`}>
      <span className="beat-number">{cell.beatIndex + 1}</span>

      <div className="notation">{cell.symbol}</div>
      <strong>{text}</strong>
      <small>{cell.label}</small>

      <div className="subdivision-track">
        {cell.subdivisions.map((part, index) => (
          <span
            key={index}
            className={[
              "subdivision",
              part,
              activeSubdivision === index ? "active" : "",
            ].join(" ")}
          />
        ))}
      </div>
    </article>
  );
}
