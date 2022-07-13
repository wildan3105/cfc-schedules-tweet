// eslint-disable-next-line no-undef
module.exports = {
  apps : [
  {
    name: 'subscriber',
    script: 'build/events/sub.js',
    env_production: {
      NODE_ENV: "production",
    }
  },
  {
    name: 'match-reader-jobs',
    script: 'build/jobs/match-reader.js',
    cron_restart: '0 * * * *', // hourly
    autorestart: false,
    env_production: {
      NODE_ENV: "production",
    }
  },
  {
    name: 'match-fetcher-jobs',
    script: 'build/jobs/match-fetcher.js',
    cron_restart: '0 1 * * *', // At 00:00 every day
    autorestart: false,
    env_production: {
      NODE_ENV: "production",
    }
  }
],

  deploy : {
    production : {
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production && pm2 logs all',
      'pre-setup': 'npm install && npm run build'
    }
  }
};
