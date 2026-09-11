import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import styles from './HomePage.module.css';

function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // popular, new, old

  useEffect(() => {
    fetchRecipes();
  }, [category, sortBy]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      params.set('sort', sortBy);

      const response = await fetch(`/api/recipes?${params}`);
      const data = await response.json();
      setRecipes(data.results || data);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>レシピを探索しよう</h1>
        <p>美味しいレシピを見つけて、自分でも作ってみましょう</p>
      </div>

      <div className={styles.filters}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="レシピを検索..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            検索
          </button>
        </form>

        <div className={styles.filterOptions}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.select}
          >
            <option value="">全てのカテゴリ</option>
            <option value="1">和食</option>
            <option value="2">洋食</option>
            <option value="3">中華</option>
            <option value="4">デザート</option>
            <option value="5">ドリンク</option>
            <option value="6">その他</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.select}
          >
            <option value="popular">人気順</option>
            <option value="new">新規順</option>
            <option value="old">古い順</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : (
        <div className={styles.grid}>
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <div className={styles.empty}>
              <p>レシピが見つかりません</p>
              <Link to="/create" className={styles.createLink}>
                最初のレシピを投稿する
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;
