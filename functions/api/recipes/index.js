// List or create recipes
export async function onRequest(context) {
  const { env, request } = context;
  const db = env.DB;
  const url = new URL(request.url);

  // GET - List recipes
  if (request.method === 'GET') {
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const userId = url.searchParams.get('user_id');
    const sort = url.searchParams.get('sort') || 'popular';

    let query = `
      SELECT r.*, u.name as author_name, u.avatar_url as author_avatar
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (r.title LIKE ? OR r.description LIKE ? OR r.ingredients LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (category) {
      query += ' AND r.category_id = ?';
      params.push(category);
    }

    if (userId) {
      query += ' AND r.user_id = ?';
      params.push(userId);
    }

    switch (sort) {
      case 'new':
        query += ' ORDER BY r.created_at DESC';
        break;
      case 'old':
        query += ' ORDER BY r.created_at ASC';
        break;
      case 'popular':
      default:
        query += ' ORDER BY r.bookmark_count DESC, r.good_count DESC';
        break;
    }

    const recipes = await db.prepare(query).bind(...params).all();

    return new Response(JSON.stringify(recipes.results), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST - Create recipe
  if (request.method === 'POST') {
    try {
      const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
      if (!sessionCookie) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      const session = JSON.parse(sessionCookie);
      const data = await request.json();

      const result = await db.prepare(
        `INSERT INTO recipes (user_id, title, description, ingredients, steps, image_urls, video_url, category_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        session.userId,
        data.title,
        data.description || '',
        data.ingredients,
        data.steps,
        data.image_urls || null,
        data.video_url || null,
        data.category_id || null
      );

      return new Response(JSON.stringify({ id: result.meta.last_row_id }), {
        headers: { 'Content-Type': 'application/json' },
        status: 201,
      });
    } catch (error) {
      console.error('Create recipe error:', error);
      return new Response(JSON.stringify({ error: 'Failed to create recipe' }), { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
