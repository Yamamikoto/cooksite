import { useState } from 'react';
import styles from './BookmarkButton.module.css';

function BookmarkButton({ recipeId, bookmarked, onToggle }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/bookmarks/${recipeId}`, {
        method: bookmarked ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        onToggle?.(data.bookmarked);
      }
    } catch (error) {
      console.error('Bookmark toggle failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`${styles.button} ${bookmarked ? styles.bookmarked : ''}`}
      onClick={handleClick}
      disabled={loading}
      aria-label={bookmarked ? 'ブックマーク解除' : 'ブックマーク'}
    >
      {bookmarked ? '🔖' : '📑'}
    </button>
  );
}

export default BookmarkButton;
