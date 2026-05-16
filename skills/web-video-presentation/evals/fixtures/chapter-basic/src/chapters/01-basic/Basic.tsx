import "./Basic.css";

export function Basic({ step }: { step: number }) {
  return (
    <section className="basic-chapter" data-visual="workflow">
      <div className="basic-chapter__claim">Decide before drawing</div>
      {step >= 1 && (
        <svg className="basic-chapter__map" viewBox="0 0 320 120" role="img" aria-label="Workflow map">
          <circle cx="56" cy="60" r="28" />
          <circle cx="160" cy="60" r="28" />
          <circle cx="264" cy="60" r="28" />
          <path d="M84 60h48M188 60h48" />
        </svg>
      )}
      {step >= 2 && <p className="basic-chapter__caption">Voice -> outline -> chapter</p>}
    </section>
  );
}
