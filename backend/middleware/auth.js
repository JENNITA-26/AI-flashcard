// backend/middleware/auth.js
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

/**
 * Express middleware that enforces Supabase JWT Authentication on protected API endpoints.
 * Expects header: Authorization: Bearer <access_token>
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is empty.',
      });
    }

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message:
          'Supabase backend credentials are not configured in backend/.env. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error?.message || 'Invalid or expired authentication token.',
      });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata || {},
    };

    return next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify authentication token.',
    });
  }
}

