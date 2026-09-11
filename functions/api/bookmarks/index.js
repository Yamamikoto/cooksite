// List or create bookmarks
export async function onRequest(context) {
  const { env, request } = context;

  // GET - List bookmarks
  if (request.method === 'GET') {
    try {
      const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
      if (!sessionCookie) {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const session = JSON.parse(sessionCookie);
      const db = env.DB;

      const bookmarks = await db.prepare(
        `SELECT r.*, u.name as author_name
         FROM bookmarks b
         JOIN recipes r ON b.recipe_id = r.id
         JOIN users u ON r.user_id = u.id
         WHERE b.user_id = ?
         ORDER BY b.created_at DESC`
      ).all(session.userId);

      return new Response(JSON.stringify(bookmarks.results), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('List bookmarks error:', error);
      return new Response(JSON.stringify({ error: 'Failed to list bookmarks' }), { status: 500 });
    }
  }

  // POST - Create bookmark
  if (request.method === 'POST') {
    try {
      const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
      if (!sessionCookie) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      const session = JSON.parse(sessionCookie);
      const data = await request.json();
      const db = env.DB;
      const recipeId = data.recipeId;

      // Check if recipe exists
      const recipe = await db.prepare('SELECT id FROM recipes WHERE id = ?').get(recipeId);
      if (!recipe) {
        return new Response(JSON.stringify({ error: 'Recipe not found' }), { status: 404 });
      }

      // Check if already bookmarked
      const existing = await db.prepare(
        'SELECT id FROM bookmarks WHERE user_id = ? AND recipe_id = ?'
      ).get(session.userId, recipeId);

      if (existing) {
        return new Response(JSON.stringify({ bookmarked: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Create bookmark
      await db.prepare(
        'INSERT INTO bookmarks (user_id, recipe_id) VALUES (?, ?)'
      ).run(session.userId, recipeId);

      // Update bookmark_count
      await db.prepare(
        'UPDATE recipes SET bookmark_count = bookmark_count + 1 WHERE id = ?'
      ).run(recipeId);

      return new Response(JSON.stringify({ bookmarked: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Create bookmark error:', error);
      return new Response(JSON.stringify({ error: 'Failed to create bookmark' }), { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
