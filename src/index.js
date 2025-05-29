module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    const email = 'yunusakarakar@gmail.com'; // kendi admin email'in
    
    const user = await strapi.query('admin::user').findOne({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Kullanıcı bulunamadı: ${email}`);
      return;
    }

    const superAdminRole = await strapi.query('admin::role').findOne({
      where: { code: 'strapi-super-admin' },
    });

    if (!superAdminRole) {
      console.log('❌ Super Admin rolü bulunamadı.');
      return;
    }

    await strapi.query('admin::user').update({
      where: { id: user.id },
      data: {
        roles: [superAdminRole.id],
      },
    });

    console.log(`✅ ${email} kullanıcısına Super Admin rolü atandı!`);
  },
};
