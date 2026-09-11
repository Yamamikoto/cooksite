// Toggle bookmark
export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const recipeId = url.pathname.split('/').pop();

  // GET - Check if bookmarked
  if (request.method === 'GET') {
    try {
      const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
      if (!sessionCookie) {
        return new Response(JSON.stringify({ bookmarked: false }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const session = JSON.parse(sessionCookie);
      const db = env.DB;

      const bookmark = await db.prepare(
        'SELECT id FROM bookmarks WHERE user_id = ? AND recipe_id = ?'
      ).get(session.userId, recipeId);

      return new Response(JSON.stringify({ bookmarked: !!bookmark }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Check bookmark error:', error);
      return new Response(JSON.stringify({ error: 'Failed to check bookmark' }), { status: 500 });
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
      const db = env.DB;

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

  // DELETE - Remove bookmark
  if (request.method === 'DELETE') {
    try {
      const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
      if (!sessionCookie) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      const session = JSON.parse(sessionCookie);
      const db = env.DB;

      // Check if bookmark exists
      const bookmark = await db.prepare(
        'SELECT id FROM bookmarks WHERE user_id = ? AND recipe_id = ?'
      ).get(session.userId, recipeId);

      if (!bookmark) {
        return new Response(JSON.stringify({ bookmarked: false }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Remove bookmark
      await db.prepare(
        'DELETE FROM bookmarks WHERE user_id = ? AND recipe_id = ?'
      ).run(session.userId, recipeId);

      // Update bookmark_count
      await db.prepare(
        'UPDATE recipes SET bookmark_count = bookmark_count - 1 WHERE id = ?'
      ).run(recipeId);

      return new Response(JSON.stringify({ bookmarked: false }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Delete bookmark error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete bookmark' }), { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
