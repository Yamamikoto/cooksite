// Logout
export async function onRequest(context) {
  const response = new Response(JSON.stringify({ success: true }), { status: 200 });
  response.headers.set('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; Max-Age=0');
  return response;
}
