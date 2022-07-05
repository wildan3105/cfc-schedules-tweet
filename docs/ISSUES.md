## List of issues during development

### Productivity
- [ ] Restart upon code changes is still not working for `ts-node-dev`

### Functionality
- [ ] Upcoming fixture date time isn't really accurate (due to inconsistency of date & time field from serp API & near-correct conversion of the internal lib) -> aim for MVP

### Code 
- [ ] Use `RedisStorage` from its class rather than initiating it on its own from `./event/sub.ts`