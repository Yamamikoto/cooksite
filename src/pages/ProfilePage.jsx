import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import ReviewList from '../components/ReviewList';
import styles from './ProfilePage.module.css';

function ProfilePage({ user }) {
  const [recipes, setRecipes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [recipesRes, reviewsRes] = await Promise.all([
        fetch(`/api/recipes?user_id=${user.id}`),
        fetch(`/api/reviews?user_id=${user.id}`),
      ]);

      const recipesData = await recipesRes.json();
      const reviewsData = await reviewsRes.json();

      setRecipes(recipesData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.profile}>
        {user.avatar_url && (
          <img src={user.avatar_url} alt={user.name} className={styles.avatar} />
        )}
        <h1>{user.name}</h1>
        <p className={styles.email}>{user.email}</p>
        <p className={styles.joined}>
          参加: {new Date(user.created_at).toLocaleDateString('ja-JP')}
        </p>
      </div>

      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : (
        <>
          <section className={styles.section}>
            <h2>投稿したレシピ ({recipes.length})</h2>
            {recipes.length > 0 ? (
              <div className={styles.grid}>
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>まだレシピを投稿していません</p>
            )}
          </section>

          <section className={styles.section}>
            <h2>書いたレビュー ({reviews.length})</h2>
            {reviews.length > 0 ? (
              <ReviewList reviews={reviews} />
            ) : (
              <p className={styles.empty}>まだレビューを書いていません</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default ProfilePage;
