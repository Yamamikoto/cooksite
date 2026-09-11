// Google OAuth Callback
export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Authorization code not provided', { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${url.origin}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();

    // Store user in D1
    const db = env.DB;
    await db.prepare(
      `INSERT INTO users (id, name, email, avatar_url)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, email = excluded.email, avatar_url = excluded.avatar_url`
    ).run(userData.id, userData.name, userData.email, userData.picture);

    // Set session cookie
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const secureFlag = isLocalhost ? '' : '; Secure';

    const cookieValue = JSON.stringify({
      userId: userData.id,
      name: userData.name,
      email: userData.email,
      avatar_url: userData.picture,
    });

    return new Response('Redirecting...', {
      status: 302,
      headers: {
        'Location': `${url.origin}/`,
        'Set-Cookie': `session=${cookieValue}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 30}${secureFlag}`,
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
}
