import "./Invalid.css";

export function Invalid({ step }: { step: number }) {
  return (
    <section>
      <p>Broken fixture</p>
      {step === 2 && <p>Unmatched step</p>}
    </section>
  );
}
