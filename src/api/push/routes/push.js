'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/push/health',
      handler: 'push.health',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/push/announce',
      handler: 'push.announce',
      config: { auth: false },
    },
  ],
};
