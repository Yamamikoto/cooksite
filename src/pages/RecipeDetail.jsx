import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import GoodBadButton from '../components/GoodBadButton';
import BookmarkButton from '../components/BookmarkButton';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import VideoPlayer from '../components/VideoPlayer';
import styles from './RecipeDetail.module.css';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchRecipe();
    fetchReviews();
    checkAuth();
    checkBookmark();
  }, [id]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${id}`);
      const data = await response.json();
      setRecipe(data);
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/${id}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const checkBookmark = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${id}`);
      const data = await response.json();
      setBookmarked(data.bookmarked);
    } catch (error) {
      console.error('Failed to check bookmark:', error);
    }
  };

  const handleVote = (data) => {
    if (recipe) {
      setRecipe({
        ...recipe,
        good_count: data.goodCount,
        bad_count: data.badCount,
      });
    }
  };

  const handleBookmarkToggle = (bookmarked) => {
    setBookmarked(bookmarked);
    if (recipe) {
      setRecipe({
        ...recipe,
        bookmark_count: bookmarked ? recipe.bookmark_count + 1 : recipe.bookmark_count - 1,
      });
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        fetchReviews();
        fetchRecipe();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('このレシピを削除しますか？')) return;

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  const imageUrls = recipe?.image_urls ? JSON.parse(recipe.image_urls) : [];

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  if (!recipe) {
    return <div className={styles.notFound}>レシピが見つかりません</div>;
  }

  const isOwner = user && user.id === recipe.user_id;

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backLink}>
        ← 一覧に戻る
      </Link>

      <div className={styles.header}>
        <h1>{recipe.title}</h1>
        <div className={styles.meta}>
          <span className={styles.author}>
            {recipe.author_name}
          </span>
          <span className={styles.date}>
            {new Date(recipe.created_at).toLocaleDateString('ja-JP')}
          </span>
          {recipe.avg_rating > 0 && (
            <span className={styles.rating}>
              ⭐ {recipe.avg_rating.toFixed(1)} ({recipe.review_count}件のレビュー)
            </span>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {isOwner && (
          <>
            <button
              onClick={() => navigate(`/recipes/${id}/edit`)}
              className={styles.editButton}
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              className={styles.deleteButton}
            >
              削除
            </button>
          </>
        )}
        <BookmarkButton
          recipeId={recipe.id}
          bookmarked={bookmarked}
          onToggle={handleBookmarkToggle}
        />
      </div>

      {imageUrls.length > 0 && (
        <div className={styles.imageGallery}>
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`${recipe.title} - 画像${index + 1}`}
              className={styles.galleryImage}
            />
          ))}
        </div>
      )}

      {recipe.video_url && (
        <VideoPlayer src={recipe.video_url} />
      )}

      <div className={styles.content}>
        {recipe.description && (
          <div className={styles.section}>
            <h2>説明</h2>
            <p>{recipe.description}</p>
          </div>
        )}

        <div className={styles.section}>
          <h2>材料</h2>
          <pre className={styles.ingredients}>{recipe.ingredients}</pre>
        </div>

        <div className={styles.section}>
          <h2>作り方</h2>
          <pre className={styles.steps}>{recipe.steps}</pre>
        </div>
      </div>

      <div className={styles.reactions}>
        <GoodBadButton
          recipeId={recipe.id}
          goodCount={recipe.good_count}
          badCount={recipe.bad_count}
          onVote={handleVote}
        />
      </div>

      <div className={styles.reviews}>
        <h2>レビュー ({reviews.length})</h2>
        {user ? (
          <>
            <ReviewForm recipeId={recipe.id} onSubmit={handleReviewSubmit} />
            <ReviewList reviews={reviews} />
          </>
        ) : (
          <p className={styles.loginPrompt}>
            <Link to="/api/auth/login">ログイン</Link>してレビューを書きましょう
          </p>
        )}
      </div>
    </div>
  );
}

export default RecipeDetail;
