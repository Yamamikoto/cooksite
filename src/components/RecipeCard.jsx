import { Link } from 'react-router-dom';
import styles from './RecipeCard.module.css';

function RecipeCard({ recipe }) {
  const imageUrl = recipe.image_urls
    ? JSON.parse(recipe.image_urls)[0]
    : null;

  return (
    <Link to={`/recipes/${recipe.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.title} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>画像なし</div>
        )}
        {recipe.video_url && (
          <span className={styles.videoBadge}>🎥 動画あり</span>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{recipe.title}</h3>
        <p className={styles.description}>
          {recipe.description?.substring(0, 100)}
          {recipe.description?.length > 100 ? '...' : ''}
        </p>
        <div className={styles.meta}>
          <span className={styles.author}>{recipe.author_name}</span>
          <div className={styles.stats}>
            {recipe.avg_rating > 0 && (
              <span className={styles.rating}>
                ⭐ {recipe.avg_rating.toFixed(1)}
              </span>
            )}
            <span className={styles.reviews}>
              💬 {recipe.review_count}
            </span>
            <span className={styles.goods}>
              👍 {recipe.good_count}
            </span>
            <span className={styles.bookmarks}>
              🔖 {recipe.bookmark_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;
