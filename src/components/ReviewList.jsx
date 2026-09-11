import { Link } from 'react-router-dom';
import styles from './ReviewList.module.css';

function ReviewList({ reviews, recipeId }) {
  if (!reviews || reviews.length === 0) {
    return <p className={styles.empty}>まだレビューがありません。最初のレビューを書きましょう！</p>;
  }

  return (
    <div className={styles.list}>
      {reviews.map((review) => (
        <div key={review.id} className={styles.review}>
          <div className={styles.header}>
            <span className={styles.author}>{review.author_name}</span>
            <span className={styles.date}>
              {new Date(review.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
          <div className={styles.rating}>
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </div>
          {review.comment && <p className={styles.comment}>{review.comment}</p>}
          <div className={styles.footer}>
            <span>👍 {review.good_count}</span>
            <span>👎 {review.bad_count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReviewList;
