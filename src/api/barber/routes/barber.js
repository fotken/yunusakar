'use strict';

/**
 * barber router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::barber.barber');
