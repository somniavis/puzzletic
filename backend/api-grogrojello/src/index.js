/**
 * Cloudflare Worker for Grogrojello
 * Handles sync between Client and D1 Database
 */

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;

		// CORS Headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		// Handle OPTIONS (CORS preflight)
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// Router
		if (path.startsWith('/api/users/')) {
			const uid = path.split('/').pop();
			if (!uid) return new Response('Missing UID', { status: 400, headers: corsHeaders });

			// GET: Retrieve User Data
			if (request.method === 'GET') {
				try {
					// Binding name matches what triggered in creating DB, likely 'grogrojello_db' or 'DB'
					// We set it to 'DB' in previous step via cli input
					const stmt = env.DB.prepare('SELECT * FROM users WHERE uid = ?').bind(uid);
					const result = await stmt.first();

					if (!result) {
						return new Response(JSON.stringify({ found: false }), {
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}

					// Parse JSON fields
					if (result.inventory) result.inventory = JSON.parse(result.inventory);

					return new Response(JSON.stringify({ found: true, data: result }), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				} catch (err) {
					return new Response(JSON.stringify({ error: err.message }), {
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}
			}

			// POST: Sync/Upsert User Data
			if (request.method === 'POST') {
				try {
					const body = await request.json();
					const { email, displayName, level, xp, glo, inventory, createdAt } = body;

					// Use current timestamp for sync time
					const now = Date.now();

					const stmt = env.DB.prepare(`
            INSERT INTO users (uid, email, display_name, level, xp, glo, inventory, created_at, last_synced_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(uid) DO UPDATE SET
              email = excluded.email,
              display_name = excluded.display_name,
              level = excluded.level,
              xp = excluded.xp,
              glo = excluded.glo,
              inventory = excluded.inventory,
              last_synced_at = excluded.last_synced_at
          `).bind(
						uid,
						email,
						displayName,
						level || 1,
						xp || 0,
						glo || 0,
						JSON.stringify(inventory || []),
						createdAt || null,
						now
					);

					await stmt.run();

					return new Response(JSON.stringify({ success: true, syncedAt: now }), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				} catch (err) {
					return new Response(JSON.stringify({ error: err.message }), {
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}
			}
		}

		return new Response('Not Found', { status: 404, headers: corsHeaders });
	},
};
