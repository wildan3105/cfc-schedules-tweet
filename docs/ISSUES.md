## List of issues during development

### Productivity

- [x] Restart upon code changes is still not working for `ts-node-dev`: solved in [6bd683616647a78d21b9ededeb6d2c0f85670262](https://github.com/wildan3105/cfc-schedules-tweet/commit/6bd683616647a78d21b9ededeb6d2c0f85670262)
- [x] `npm run format` is only running after committing the code so need to re-add and re-commit -> workaround: run prettier on-save in my local
- [x] Github workflow for unit test is still failed. solved in [aaf54a863de4ef14670df3afdebc429339a45e40](https://github.com/wildan3105/cfc-schedules-tweet/commit/aaf54a863de4ef14670df3afdebc429339a45e40)
- [ ] `docker-compose` for local development (and for deploying to server) for the sake of convenient

### Functionality

- [ ] Upcoming fixture date time isn't really accurate (due to inconsistency of date & time field from serp API & near-correct conversion of the internal lib) -> aim for MVP
- [ ] Need to handle `TBD` time more gracefully

### Code

- [ ] Use `RedisStorage` from its class rather than initiating it on its own from `./event/sub.ts`

### Observability
- [ ] App is silently fail when connection to redis isn't established properly (not connected yet)
