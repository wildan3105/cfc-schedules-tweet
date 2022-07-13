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
    cron_restart: '*/1 * * * *', // hourly
    autorestart: false,
    env_production: {
      NODE_ENV: "production",
    }
  },
  {
    name: 'match-fetcher-jobs',
    script: 'build/jobs/match-fetcher.js',
    cron_restart: '0 0 */2 * *', // At 00:00 on every 2nd day-of-month
    autorestart: false,
    env_production: {
      NODE_ENV: "production",
    }
  }
],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'npm install & npm run build'
    }
  }
};
