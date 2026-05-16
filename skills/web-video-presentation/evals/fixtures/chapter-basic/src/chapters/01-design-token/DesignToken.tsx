import "./DesignToken.css";

export function DesignToken({ step }: { step: number }) {
  return (
    <section className="design-token-chapter" data-visual="token-map">
      <h1 className="design-token-chapter__headline">Design Token = 团队契约</h1>
      {step >= 1 && (
        <svg className="design-token-chapter__map" viewBox="0 0 560 180" role="img" aria-label="Token layers">
          <circle cx="90" cy="90" r="48" />
          <circle cx="280" cy="90" r="48" />
          <circle cx="470" cy="90" r="48" />
          <path d="M138 90H232M328 90H422" />
        </svg>
      )}
      {step >= 2 && <p className="design-token-chapter__caption">Global -> Alias -> Component</p>}
      {step >= 3 && <p className="design-token-chapter__caption">一份定义，多端输出</p>}
      {step >= 4 && <p className="design-token-chapter__caption">不污染全局，也不丢失一致</p>}
      {step >= 5 && <p className="design-token-chapter__caption">Style Dictionary 负责翻译</p>}
      {step >= 6 && <p className="design-token-chapter__caption">系统成为契约，而不是文档</p>}
    </section>
  );
}
