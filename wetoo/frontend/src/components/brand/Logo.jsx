/**
 * Logo WeToo.
 * Bulle de discussion contenant un cœur : « parler » + « prendre soin ».
 * `showText` affiche le nom de la marque à côté du symbole.
 */
export function Logo({ size = 34, showText = true, className = '' }) {
  return (
    <span className={`logo ${className}`.trim()}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="WeToo"
        className="logo__mark"
      >
        <defs>
          <linearGradient id="wetooLogoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="55%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
        </defs>
        <path
          d="M24 4C12.4 4 3 11.8 3 21.4c0 5.6 3 10.6 7.7 13.9-.3 3.2-1.4 6.4-3.3 8.7 4.3-.5 8.4-2 11.7-4.3 1.6.3 3.2.4 4.9.4 11.6 0 21-7.8 21-17.4S35.6 4 24 4Z"
          fill="url(#wetooLogoGrad)"
        />
        <path
          d="M24 30.5S15.5 25 15.5 19.6a4.6 4.6 0 0 1 8.5-2.4 4.6 4.6 0 0 1 8.5 2.4c0 5.4-8.5 10.9-8.5 10.9Z"
          fill="#fff"
        />
      </svg>
      {showText ? <span className="logo__text">WeToo</span> : null}
    </span>
  );
}
