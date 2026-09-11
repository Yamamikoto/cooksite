// Get reviews for a recipe
export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const recipeId = url.pathname.split('/').pop();

  const db = env.DB;
  const reviews = await db.prepare(
    `SELECT r.*, u.name as author_name, u.avatar_url as author_avatar
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.recipe_id = ?
     ORDER BY r.created_at DESC`
  ).all(recipeId);

  return new Response(JSON.stringify(reviews.results), {
    headers: { 'Content-Type': 'application/json' },
  });
}
