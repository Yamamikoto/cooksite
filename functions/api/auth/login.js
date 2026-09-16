// Google OAuth Login
export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const callbackUrl = env.OAUTH_CALLBACK_URL || `${url.origin}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
  });

  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302);
}
