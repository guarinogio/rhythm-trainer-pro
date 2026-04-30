export default function Stepper({
  label,
  value,
  helper,
  min = 1,
  max = 40,
  disabled = false,
  onChange,
}) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="field-block">
      <span className="field-label">{label}</span>

      <div className="stepper-control">
        <button type="button" onClick={decrement} disabled={disabled || value <= min}>
          −
        </button>

        <div className="stepper-value">
          <strong>{value}</strong>
          <small>beat-units</small>
        </div>

        <button type="button" onClick={increment} disabled={disabled || value >= max}>
          +
        </button>
      </div>

      {helper && <p className="field-helper">{helper}</p>}
    </div>
  );
}
