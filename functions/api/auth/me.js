// Get current user
export async function onRequest(context) {
  const { request, env } = context;
  const cookieHeader = request.headers.get('cookie') || '';
  const sessionCookie = cookieHeader.split('session=')[1]?.split(';')[0];

  if (!sessionCookie) {
    return new Response(JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const session = JSON.parse(sessionCookie);
    const db = env.DB;
    const user = await db.prepare('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?').get(session.userId);

    if (user) {
      return new Response(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }

  return new Response(JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  });
}
