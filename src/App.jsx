import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RecipeDetail from './pages/RecipeDetail';
import CreatePage from './pages/CreatePage';
import EditPage from './pages/EditPage';
import ProfilePage from './pages/ProfilePage';
import BookmarkPage from './pages/BookmarkPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header user={user} onLogout={handleLogout} />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route
            path="/create"
            element={user ? <CreatePage /> : <Navigate to="/" />}
          />
          <Route
            path="/recipes/:id/edit"
            element={user ? <EditPage /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={user ? <ProfilePage user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/bookmarks"
            element={user ? <BookmarkPage /> : <Navigate to="/" />}
          />
        </Routes>
      </main>
      <footer style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
        <p>&copy; 2024 レシピシェア</p>
      </footer>
    </div>
  );
}

export default App;
