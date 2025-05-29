'use strict';

/**
 * barber service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::barber.barber');
