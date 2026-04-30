import { getCellSpan, getSyllable } from '../lib/rhythm.js';

export function PatternGrid({ pattern, activeIndex, activeProgress, studyMode }) {
  let beatCursor = 1;

  return (
    <section className="pattern-section" aria-labelledby="pattern-title">
      <div className="pattern-header">
        <div>
          <h2 id="pattern-title">Generated Pattern</h2>
          <p>No manual cell editing. Use Generate New Pattern for a fresh exercise.</p>
        </div>
      </div>

      <div className="pattern-grid">
        {pattern.map((item, index) => {
          const start = beatCursor;
          const end = beatCursor + item.beats - 1;
          beatCursor += item.beats;
          const span = getCellSpan(item);
          const isActive = activeIndex === index;

          return (
            <article
              key={`${index}-${item.id}-${start}`}
              className={`rhythm-cell span-${span} ${item.events.length ? '' : 'is-rest'} ${isActive ? 'active' : ''}`}
              style={{ gridColumn: `span ${span}` }}
            >
              <span className="beat-number">{start === end ? start : `${start}–${end}`}</span>
              <div className="music-symbol">{item.symbol}</div>
              <div className="syllable">{getSyllable(item, studyMode)}</div>
              <div className="label">{item.label} · {item.beats} {item.beats === 1 ? 'beat' : 'beats'}</div>
              {isActive && <div className="progress" style={{ width: `${Math.min(100, Math.max(0, activeProgress * 100))}%` }} />}
            </article>
          );
        })}
      </div>
    </section>
  );
}
