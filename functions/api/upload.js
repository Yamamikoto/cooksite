// Upload file to R2
export async function onRequest(context) {
  const { env, request } = context;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bucket = env.BUCKET;

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;

    // Upload to R2
    await bucket.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Get public URL
    const url = `https://public.r2.cloudflarestorage.com/${filename}`;

    return new Response(JSON.stringify({ url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload file' }), { status: 500 });
  }
}
