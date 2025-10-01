// @ts-nocheck
'use strict';

// Node 18+ kullanıyorsun, global fetch var.
const httpFetch = global.fetch ? global.fetch.bind(global) : null;

const isExpoToken = (t) => typeof t === 'string' && t.startsWith('ExponentPushToken[');
const chunk = (arr, n = 100) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

module.exports = {
  async health(ctx) {
    ctx.send({ ok: true, env: process.env.NODE_ENV || 'unknown' });
  },

  async announce(ctx) {
    const headerKey =
      ctx.request.headers['x-api-key'] ||
      (ctx.request.headers['authorization'] || '').replace(/^Bearer\s+/i, '');

    const secret = process.env.PUSH_SECRET || process.env.STRAPI_PUSH_API_TOKEN;
    if (!secret || headerKey !== secret) return ctx.unauthorized('Invalid or missing API key');

    const { title, body = '', data } = ctx.request.body || {};
    if (!title) return ctx.badRequest('Missing "title"');

    const customers = await strapi.db.query('api::customer.customer').findMany({
      select: ['expoPushToken'],
      where: { expoPushToken: { $not: null } },
      limit: 10000,
    });

    const tokens = [...new Set((customers || []).map(c => c.expoPushToken).filter(isExpoToken))];
    if (!tokens.length) return ctx.send({ ok: true, totalTokens: 0, sent: 0, message: 'No tokens' });

    let sent = 0;
    for (const slice of chunk(tokens, 100)) {
      const messages = slice.map(to => ({
        to,
        title,
        body,
        data: { tab: 'notification', ...(data || {}) },
        sound: 'default',
        priority: 'high',
      }));
      try {
        if (!httpFetch) throw new Error('fetch not available');
        await httpFetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(messages),
        });
        sent += slice.length;
      } catch (e) {
        strapi.log.error('Expo push send error:', e);
      }
    }

    ctx.send({ ok: true, totalTokens: tokens.length, sent });
  },
};
