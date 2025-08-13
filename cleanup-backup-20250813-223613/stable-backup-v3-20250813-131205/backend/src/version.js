// Version tracking for deployment verification
const version = {
  commit: process.env.RENDER_GIT_COMMIT || 'unknown',
  builtAt: process.env.BUILD_TIME || new Date().toISOString(),
  nodeVersion: process.version,
  timestamp: new Date().toISOString()
};

module.exports = { version };
