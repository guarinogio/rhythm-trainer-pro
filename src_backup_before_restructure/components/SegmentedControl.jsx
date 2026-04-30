export default function SegmentedControl({
  label,
  value,
  options,
  disabled = false,
  onChange,
}) {
  return (
    <div className="field-block">
      <span className="field-label">{label}</span>

      <div className="segmented-control">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            className={value === option.value ? "active" : ""}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="field-helper">
        {options.find((option) => option.value === value)?.helper}
      </p>
    </div>
  );
}
