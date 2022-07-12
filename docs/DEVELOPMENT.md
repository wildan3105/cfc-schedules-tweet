## Tips and trick

This doc contains tips and trick when developing the app locally

### Redis

1. Start/stop/status of redis-server

```bash
sudo service redis-server start/stop/status
```

2. Go into redis-server

```bash
wildan@LAPTOP-C4SG4SD2:/mnt/c/Users/62823/Documents$ redis-cli
127.0.0.1:6379> auth redis123
OK
127.0.0.1:6379> ping
PONG
127.0.0.1:6379>
```

### Run the jobs locally using `pm2`
- Syntax:
```bash
pm2 start file.js --cron "* * * * *"
```