// Get, update, or delete a recipe
export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const recipeId = url.pathname.split('/').pop();

  // GET - Get recipe details
  if (request.method === 'GET') {
    const db = env.DB;
    const recipe = await db.prepare(
      `SELECT r.*, u.name as author_name, u.avatar_url as author_avatar
       FROM recipes r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`
    ).get(recipeId);

    if (!recipe) {
      return new Response(JSON.stringify({ error: 'Recipe not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(recipe), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // PUT - Update recipe
  if (request.method === 'PUT') {
    try {
      const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
      if (!sessionCookie) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      const session = JSON.parse(sessionCookie);
      const data = await request.json();
      const db = env.DB;

      // Check ownership
      const recipe = await db.prepare('SELECT user_id FROM recipes WHERE id = ?').get(recipeId);
      if (!recipe) {
        return new Response(JSON.stringify({ error: 'Recipe not found' }), { status: 404 });
      }
      if (recipe.user_id !== session.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
      }

      await db.prepare(
        `UPDATE recipes
         SET title = ?, description = ?, ingredients = ?, steps = ?,
             image_urls = ?, video_url = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).run(
        data.title,
        data.description || '',
        data.ingredients,
        data.steps,
        data.image_urls || null,
        data.video_url || null,
        data.category_id || null,
        recipeId
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Update recipe error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update recipe' }), { status: 500 });
    }
  }

  // DELETE - Delete recipe
  if (request.method === 'DELETE') {
    try {
      const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
      if (!sessionCookie) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      const session = JSON.parse(sessionCookie);
      const db = env.DB;

      // Check ownership
      const recipe = await db.prepare('SELECT user_id FROM recipes WHERE id = ?').get(recipeId);
      if (!recipe) {
        return new Response(JSON.stringify({ error: 'Recipe not found' }), { status: 404 });
      }
      if (recipe.user_id !== session.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
      }

      await db.prepare('DELETE FROM recipes WHERE id = ?').run(recipeId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Delete recipe error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete recipe' }), { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
