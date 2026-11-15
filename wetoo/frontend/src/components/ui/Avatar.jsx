import { initials } from '../../lib/format.js';

const TONES = ['purple', 'teal', 'rose', 'amber', 'blue', 'green'];

function toneFor(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  return TONES[hash % TONES.length];
}

/**
 * Avatar.
 * - `avatar` : emoji (si la chaîne n'est pas vide et n'est pas une URL) ou URL d'image.
 * - Sinon, affiche les initiales du nom sur un fond coloré déterministe.
 */
export function Avatar({ name = '', avatar, size = 'md', className = '', ...rest }) {
  const isUrl = typeof avatar === 'string' && /^(https?:|\/|data:)/.test(avatar);
  const isEmoji = typeof avatar === 'string' && avatar.length > 0 && !isUrl;

  return (
    <span
      className={`avatar avatar--${size} ${className}`.trim()}
      title={name || undefined}
      {...rest}
    >
      {isUrl ? (
        <img src={avatar} alt="" className="avatar__img" loading="lazy" />
      ) : isEmoji ? (
        <span className="avatar__emoji" aria-hidden="true">
          {avatar}
        </span>
      ) : (
        <span className={`avatar__initials avatar__initials--${toneFor(name)}`} aria-hidden="true">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
