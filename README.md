### cfc-schedules-tweet

Send tweets ahead of Chelsea FC's match!

### High-level flow
1. Save next 7-day fixtures of @ChelseaFC in a cache
2. Upon 1-day/1-hour before the match, broadcast the tweet with this minimum information:
    - opponent
    - date/time
    - stadium
    - competition

### Example of the tweet
```Markdown
[MatchDay!]
#UCL 
🆚 Chelsea vs Real Madrid
🏟️ Stamford Bridge
📅 March 20, 2022
⏱️ 2AM GMT+7

#ChelseaFC #CFCFixture
```


### Progress:
- [ ] Find the right format of tweet (info + emoji)
- [ ] Fetch Chelsea FC's upcoming fixtures in one month via Google API / other API
- [ ] 