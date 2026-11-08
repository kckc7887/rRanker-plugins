module.exports = config => ({
  ...config,
  extra: { ...config.extra, osuOAuthClientSecret: process.env.OSU_OAUTH_CLIENT_SECRET ?? '' },
});
