## Progress

### Match fetcher block

**Scope**:

> serp api until feed data into redis feeding

**Progress**:

- [x] HTTP module to integrate with SERPAPI
- [x] Cronjob to call SERPAPI monthly
- [x] Format the data to feed into redis
- [x] Feed redis with certain key
- [x] Make sure key is set correctly (TTL for now)
- [x] Make sure key is always exist // can be ensured by running job more frequently than the key's TTL
- [ ] Check for the duplicates entry (previous & following run)

### Match reader block

**Scope**:

> redis key-value store (TTL, invalidation, etc.) until calling the publisher

- [x] Cronjob to (1st version) run every 5mins
- [x] Publish an event for
  - [x] day-1 before the match
  - [x] hour-1 before the match and then remove the particular match from the redis key
- [x] Integration with `match-fetcher` block (simulate it using 24mins and 1mins before the match!)

**Scenario**
- 

**Progress**:

### Match pub/sub block

**Scope**:

> pub/sub mechanism and all its logic

**Progress**:

- [ ]

### Match twitter block

**Scope**:

> sending and styling the tweets

**Progress**:

- [ ]

### Other (deployment, testing, contribution guideline, etc.)

**Progress**:

- [ ] Add logger (pino) to increase service's observability
- [ ] Use docker-compose for deployment
