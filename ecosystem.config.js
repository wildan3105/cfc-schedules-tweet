// eslint-disable-next-line no-undef
module.exports = {
  apps : [
  {
    name: 'subscriber',
    script: 'build/events/sub.js',
  },
  {
    name: 'match-reader-jobs',
    script: 'build/jobs/match-reader.js',
    cron_restart: '*/1 * * * *', // hourly, need to specify exact hour to avoid redis downtime
    autorestart: false
  },
  {
    name: 'match-fetcher-jobs',
    script: 'build/jobs/match-fetcher.js',
    cron_restart: '*/1 * * * *', // weekly, need to specify exact day and hour to avoid redis downtime (maintenance window)
    autorestart: false
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
      'pre-setup': ''
    }
  }
};
