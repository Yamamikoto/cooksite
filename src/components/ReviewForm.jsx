import { useState } from 'react';
import StarRating from './StarRating';
import styles from './ReviewForm.module.css';

function ReviewForm({ recipeId, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('星評価を選択してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({ recipeId, rating, comment });
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>レビューを書く</h3>

      <div className={styles.field}>
        <label>評価</label>
        <StarRating rating={rating} onRate={setRating} size="large" />
      </div>

      <div className={styles.field}>
        <label htmlFor="comment">コメント（任意）</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="レシピの感想を教えてください"
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? '送信中...' : 'レビューを投稿'}
      </button>
    </form>
  );
}

export default ReviewForm;
