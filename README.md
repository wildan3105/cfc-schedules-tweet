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

### Cron scheduling
- `match-fetcher` -> runs **every day** to accommodate latest updates from google API
   - key's TTL: **2 days** -> to ensure key availability in the case of `match-fetcher` fails to set the key once
- `match-reader`  -> runs **every hour** to give more closer reminder (day-1 and hour-1)