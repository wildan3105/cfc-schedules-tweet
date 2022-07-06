## List of issues during development

### Productivity

- [ ] Restart upon code changes is still not working for `ts-node-dev`
- [x] `npm run format` is only running after committing the code so need to re-add and re-commit -> workaround: run prettier on-save in my local
- [ ] Github workflow for unit test is still failed, error as follows: 
```bash
> cfc-schedules-tweet@0.0.1 test /home/runner/work/cfc-schedules-tweet/cfc-schedules-tweet
> jest ./**/*.test.ts
FAIL libs/calculation.test.ts
  ● Test suite failed to run
    Jest encountered an unexpected token
    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.
    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.
    By default "node_modules" folder is ignored by transformers.
    Here's what you can do:
     • If you are trying to use ECMAScript Modules, see https://jestjs.io/docs/ecmascript-modules for how to enable it.
     • If you are trying to use TypeScript, see https://jestjs.io/docs/getting-started#using-typescript
     • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
     • If you need a custom transformation specify a "transform" option in your config.
     • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.
    You'll find more details and examples of these config options in the docs:
    https://jestjs.io/docs/configura
    For information about custom transformations, see:
    https://jestjs.io/docs/code-transforma
    Details:
    /home/runner/work/cfc-schedules-tweet/cfc-schedules-tweet/libs/calculation.test.ts:1
    ({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,jest){import { calculateDateDiffsInHours } from "./calculation";
                                                                                      ^^^^^^
    SyntaxError: Cannot use import statement outside a module
      at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1796:14)
      at async TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:317:13)
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |       0 |        0 |       0 |       0 |                   
----------|---------|----------|---------|---------|-------------------
Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        0.413 s
Ran all test suites matching /.\/libs\/calculation.test.ts/i.
npm ERR! Test failed.  See above for more details.
Error: Process completed with exit code 1.
```
- [ ] `docker-compose` for local development (and for deploying to server) for the sake of convenient

### Functionality

- [ ] Upcoming fixture date time isn't really accurate (due to inconsistency of date & time field from serp API & near-correct conversion of the internal lib) -> aim for MVP

### Code

- [ ] Use `RedisStorage` from its class rather than initiating it on its own from `./event/sub.ts`

### Observability
- [ ] App is silently fail when connection to redis isn't established properly (not connected yet)
