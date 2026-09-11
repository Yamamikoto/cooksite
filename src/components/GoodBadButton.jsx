import { useState } from 'react';
import styles from './GoodBadButton.module.css';

function GoodBadButton({ recipeId, goodCount, badCount, onVote }) {
  const [vote, setVote] = useState(null); // 'good' | 'bad' | null
  const [loading, setLoading] = useState(false);

  const handleVote = async (type) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, type }),
      });

      if (response.ok) {
        const data = await response.json();
        setVote(data.voted ? type : null);
        onVote?.(data);
      }
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${vote === 'good' ? styles.goodActive : ''}`}
        onClick={() => handleVote('good')}
        disabled={loading}
      >
        👍 <span className={styles.count}>{goodCount}</span>
      </button>
      <button
        className={`${styles.button} ${vote === 'bad' ? styles.badActive : ''}`}
        onClick={() => handleVote('bad')}
        disabled={loading}
      >
        👎 <span className={styles.count}>{badCount}</span>
      </button>
    </div>
  );
}

export default GoodBadButton;
