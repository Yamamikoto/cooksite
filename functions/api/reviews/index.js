// List or create reviews
export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  // GET - List reviews
  if (request.method === 'GET') {
    const userId = url.searchParams.get('user_id');
    const recipeId = url.searchParams.get('recipe_id');
    const db = env.DB;

    let query = `
      SELECT r.*, u.name as author_name, u.avatar_url as author_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ' AND r.user_id = ?';
      params.push(userId);
    }

    if (recipeId) {
      query += ' AND r.recipe_id = ?';
      params.push(recipeId);
    }

    query += ' ORDER BY r.created_at DESC';

    const reviews = await db.prepare(query).bind(...params).all();

    return new Response(JSON.stringify(reviews.results), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST - Create review
  if (request.method === 'POST') {
    try {
      const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
      if (!sessionCookie) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      const session = JSON.parse(sessionCookie);
      const data = await request.json();
      const db = env.DB;

      // Check if recipe exists
      const recipe = await db.prepare('SELECT id FROM recipes WHERE id = ?').get(data.recipeId);
      if (!recipe) {
        return new Response(JSON.stringify({ error: 'Recipe not found' }), { status: 404 });
      }

      // Check if user already reviewed this recipe
      const existing = await db.prepare(
        'SELECT id FROM reviews WHERE user_id = ? AND recipe_id = ?'
      ).get(session.userId, data.recipeId);

      if (existing) {
        // Update existing review
        await db.prepare(
          `UPDATE reviews SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ? AND recipe_id = ?`
        ).run(data.rating, data.comment || '', session.userId, data.recipeId);
      } else {
        // Create new review
        await db.prepare(
          `INSERT INTO reviews (user_id, recipe_id, rating, comment)
           VALUES (?, ?, ?, ?)`
        ).run(session.userId, data.recipeId, data.rating, data.comment || '');
      }

      // Update recipe avg_rating and review_count
      const avgReview = await db.prepare(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
         FROM reviews WHERE recipe_id = ?`
      ).get(data.recipeId);

      await db.prepare(
        `UPDATE recipes SET avg_rating = ?, review_count = ? WHERE id = ?`
      ).run(avgReview.avg_rating, avgReview.review_count, data.recipeId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Create review error:', error);
      return new Response(JSON.stringify({ error: 'Failed to create review' }), { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
