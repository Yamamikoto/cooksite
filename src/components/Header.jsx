import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function Header({ user, onLogout }) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          🍳 レシピシェア
        </Link>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>
            ホーム
          </Link>
          {user && (
            <>
              <Link to="/create" className={styles.navLink}>
                投稿する
              </Link>
              <Link to="/bookmarks" className={styles.navLink}>
                ブックマーク
              </Link>
              <Link to="/profile" className={styles.navLink}>
                {user.name}
              </Link>
              <button onClick={onLogout} className={styles.logoutButton}>
                ログアウト
              </button>
            </>
          )}
          {!user && (
            <a href="/api/auth/login" className={styles.loginButton}>
              Googleでログイン
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
