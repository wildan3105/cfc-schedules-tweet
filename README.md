### cfc-schedules-tweet

Send tweets ahead of Chelsea FC's match!

### Feature(s)

1. Send a tweet ahead of Chelsea FC's match:
   - one day before the match
   - one hour before the match

### Example of the tweet

#### H-24 reminder

```Markdown
[Day - 1!]
#UCL // only support if tournament is given. otherwise fallback to `#OtherMatch`
🆚 Chelsea vs Real Madrid
🏟️ Stamford Bridge // only support `Stamford Bridge` or `Opponent's Stadium` for now
📅 March 21, 2022
⏱️ 21:00

#ChelseaFC #CFCFixture
```

#### H-1 reminder

```Markdown
[Matchday !]
#UCL // only support if tournament is given. otherwise fallback to `#OtherMatch`
🆚 Chelsea vs Real Madrid
🏟️ Stamford Bridge // only support `Stamford Bridge` or `Opponent's Stadium` for now
📅 March 20, 2022
⏱️ 21:00

#ChelseaFC #CFCFixture
```

### High-level flow

![](./diagram.png)

### How to run locally
1. Cron for fetching the matches
```bash
npm run match-fetcher
```
2. Cron for reading the matches from redis
```bash
npm run match-reader
```
3. Worker to subscribe to redis
```bash
npm run sub
```

### Cron scheduling
- `match-fetcher` -> runs **every hour**
- `match-reader`  -> runs **every 10 minutes**