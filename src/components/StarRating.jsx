import { useState } from 'react';
import styles from './StarRating.module.css';

function StarRating({ rating, onRate, size = 'medium', readonly = false }) {
  const [hover, setHover] = useState(0);

  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  }[size];

  return (
    <div className={`${styles.rating} ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={styles.star}
          disabled={readonly}
          onClick={() => !readonly && onRate?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          aria-label={`${star}星`}
        >
          {star <= (hover || rating) ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

export default StarRating;
