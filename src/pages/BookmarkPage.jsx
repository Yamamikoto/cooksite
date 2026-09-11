import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import BookmarkButton from '../components/BookmarkButton';
import styles from './BookmarkPage.module.css';

function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookmarks');
      const data = await response.json();
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = (recipeId, bookmarked) => {
    if (!bookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.id !== recipeId));
    }
  };

  return (
    <div className={styles.container}>
      <h1>ブックマーク</h1>

      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : (
        <>
          {bookmarks.length > 0 ? (
            <div className={styles.grid}>
              {bookmarks.map((recipe) => (
                <div key={recipe.id} className={styles.cardWrapper}>
                  <RecipeCard recipe={recipe} />
                  <div className={styles.cardActions}>
                    <BookmarkButton
                      recipeId={recipe.id}
                      bookmarked={true}
                      onToggle={() => handleBookmarkToggle(recipe.id, false)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>ブックマークがありません</p>
              <Link to="/" className={styles.exploreLink}>
                レシピを探索する
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BookmarkPage;
