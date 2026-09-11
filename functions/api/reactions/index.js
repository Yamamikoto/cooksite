// Reactions API - Check and vote on recipes
export async function onRequest(context) {
  const { env, request } = context;
  const db = env.DB;
  const url = new URL(request.url);

  // GET - Check if user has voted
  if (request.method === 'GET') {
    try {
      const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
      if (!sessionCookie) {
        return new Response(JSON.stringify({ hasVoted: false }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const session = JSON.parse(sessionCookie);
      const recipeId = url.searchParams.get('recipeId');

      const reaction = await db.prepare(
        'SELECT type FROM reactions WHERE user_id = ? AND recipe_id = ?'
      ).get(session.userId, recipeId);

      return new Response(JSON.stringify({
        hasVoted: !!reaction,
        type: reaction?.type || null,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Check reaction error:', error);
      return new Response(JSON.stringify({ error: 'Failed to check reaction' }), { status: 500 });
    }
  }

  // POST - Vote (good/bad)
  if (request.method === 'POST') {
    try {
      const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
      if (!sessionCookie) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      const session = JSON.parse(sessionCookie);
      const data = await request.json();
      const recipeId = data.recipeId;
      const type = data.type;

      if (!recipeId || !type) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
      }

      // Check if user already voted
      const existing = await db.prepare(
        'SELECT id, type FROM reactions WHERE user_id = ? AND recipe_id = ?'
      ).get(session.userId, recipeId);

      if (existing) {
        // If same type, remove vote (toggle off)
        if (existing.type === type) {
          await db.prepare(
            'DELETE FROM reactions WHERE user_id = ? AND recipe_id = ? AND type = ?'
          ).run(session.userId, recipeId, type);

          // Update counts
          if (type === 'good') {
            await db.prepare(
              'UPDATE recipes SET good_count = MAX(good_count - 1, 0) WHERE id = ?'
            ).run(recipeId);
          } else {
            await db.prepare(
              'UPDATE recipes SET bad_count = MAX(bad_count - 1, 0) WHERE id = ?'
            ).run(recipeId);
          }

          const updated = await db.prepare(
            'SELECT good_count, bad_count FROM recipes WHERE id = ?'
          ).get(recipeId);

          return new Response(JSON.stringify({
            goodCount: updated.good_count,
            badCount: updated.bad_count,
            voted: false,
          }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          // Different type, remove old vote and add new one
          await db.prepare(
            'DELETE FROM reactions WHERE user_id = ? AND recipe_id = ?'
          ).run(session.userId, recipeId);

          // Decrease old count
          if (existing.type === 'good') {
            await db.prepare(
              'UPDATE recipes SET good_count = MAX(good_count - 1, 0) WHERE id = ?'
            ).run(recipeId);
          } else {
            await db.prepare(
              'UPDATE recipes SET bad_count = MAX(bad_count - 1, 0) WHERE id = ?'
            ).run(recipeId);
          }

          // Add new vote
          await db.prepare(
            'INSERT INTO reactions (user_id, recipe_id, type) VALUES (?, ?, ?)'
          ).run(session.userId, recipeId, type);

          // Increase new count
          if (type === 'good') {
            await db.prepare(
              'UPDATE recipes SET good_count = good_count + 1 WHERE id = ?'
            ).run(recipeId);
          } else {
            await db.prepare(
              'UPDATE recipes SET bad_count = bad_count + 1 WHERE id = ?'
            ).run(recipeId);
          }

          const updated = await db.prepare(
            'SELECT good_count, bad_count FROM recipes WHERE id = ?'
          ).get(recipeId);

          return new Response(JSON.stringify({
            goodCount: updated.good_count,
            badCount: updated.bad_count,
            voted: true,
          }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // Record vote (new vote)
      await db.prepare(
        'INSERT INTO reactions (user_id, recipe_id, type) VALUES (?, ?, ?)'
      ).run(session.userId, recipeId, type);

      // Update counts
      if (type === 'good') {
        await db.prepare(
          'UPDATE recipes SET good_count = good_count + 1 WHERE id = ?'
        ).run(recipeId);
      } else {
        await db.prepare(
          'UPDATE recipes SET bad_count = bad_count + 1 WHERE id = ?'
        ).run(recipeId);
      }

      // Get updated counts
      const updated = await db.prepare(
        'SELECT good_count, bad_count FROM recipes WHERE id = ?'
      ).get(recipeId);

      return new Response(JSON.stringify({
        goodCount: updated.good_count,
        badCount: updated.bad_count,
        voted: true,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Vote error:', error);
      return new Response(JSON.stringify({ error: 'Failed to vote' }), { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
