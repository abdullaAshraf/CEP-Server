# Diff Details

Date : 2022-02-20 03:47:35

Directory d:\Masters\Multi-Access Edge Computing\Thesis\Enviornment\Server

Total : 53 files,  10895 codes, 159 comments, 190 blanks, all 11244 lines

[summary](results.md) / [details](details.md) / [diff summary](diff.md) / diff details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [app.ts](/app.ts) | TypeScript | 60 | 6 | 16 | 82 |
| [dist/app.js](/dist/app.js) | JavaScript | 65 | 6 | 1 | 72 |
| [dist/models/Benchmark.js](/dist/models/Benchmark.js) | JavaScript | 8 | 0 | 1 | 9 |
| [dist/models/Cluster.js](/dist/models/Cluster.js) | JavaScript | 127 | 0 | 1 | 128 |
| [dist/models/Device.js](/dist/models/Device.js) | JavaScript | 52 | 0 | 1 | 53 |
| [dist/models/ServiceRequest.js](/dist/models/ServiceRequest.js) | JavaScript | 13 | 0 | 1 | 14 |
| [dist/public/stylesheets/style.css](/dist/public/stylesheets/style.css) | CSS | 7 | 0 | 2 | 9 |
| [dist/routes/auth.js](/dist/routes/auth.js) | JavaScript | 75 | 6 | 1 | 82 |
| [dist/routes/cluster.js](/dist/routes/cluster.js) | JavaScript | 41 | 1 | 1 | 43 |
| [dist/routes/community.js](/dist/routes/community.js) | JavaScript | 148 | 14 | 1 | 163 |
| [dist/routes/index.js](/dist/routes/index.js) | JavaScript | 11 | 1 | 1 | 13 |
| [dist/routes/service.js](/dist/routes/service.js) | JavaScript | 101 | 5 | 1 | 107 |
| [dist/routes/verify.js](/dist/routes/verify.js) | JavaScript | 50 | 0 | 1 | 51 |
| [dist/schema/Cluster.js](/dist/schema/Cluster.js) | JavaScript | 30 | 0 | 1 | 31 |
| [dist/schema/Community.js](/dist/schema/Community.js) | JavaScript | 28 | 0 | 1 | 29 |
| [dist/schema/Device.js](/dist/schema/Device.js) | JavaScript | 35 | 0 | 1 | 36 |
| [dist/schema/Invitation.js](/dist/schema/Invitation.js) | JavaScript | 23 | 0 | 1 | 24 |
| [dist/schema/Service.js](/dist/schema/Service.js) | JavaScript | 37 | 0 | 1 | 38 |
| [dist/schema/User.js](/dist/schema/User.js) | JavaScript | 38 | 0 | 1 | 39 |
| [dist/services/clusterManager.js](/dist/services/clusterManager.js) | JavaScript | 113 | 1 | 1 | 115 |
| [dist/services/dataManager.js](/dist/services/dataManager.js) | JavaScript | 74 | 5 | 1 | 80 |
| [dist/services/mapper.js](/dist/services/mapper.js) | JavaScript | 43 | 0 | 1 | 44 |
| [dist/services/scheduler.js](/dist/services/scheduler.js) | JavaScript | 107 | 0 | 1 | 108 |
| [dist/services/validation.js](/dist/services/validation.js) | JavaScript | 31 | 0 | 1 | 32 |
| [dist/utilities/Utils.js](/dist/utilities/Utils.js) | JavaScript | 8 | 0 | 1 | 9 |
| [dist/utilities/dateUtils.js](/dist/utilities/dateUtils.js) | JavaScript | 9 | 0 | 1 | 10 |
| [dist/views/error.pug](/dist/views/error.pug) | Pug | 5 | 0 | 2 | 7 |
| [dist/views/index.pug](/dist/views/index.pug) | Pug | 4 | 0 | 2 | 6 |
| [dist/views/layout.pug](/dist/views/layout.pug) | Pug | 7 | 0 | 1 | 8 |
| [models/Benchmark.ts](/models/Benchmark.ts) | TypeScript | 10 | 0 | 1 | 11 |
| [models/Cluster.ts](/models/Cluster.ts) | TypeScript | 112 | 0 | 10 | 122 |
| [models/Device.ts](/models/Device.ts) | TypeScript | 36 | 0 | 6 | 42 |
| [package-lock.json](/package-lock.json) | JSON | 8,537 | 0 | 1 | 8,538 |
| [package.json](/package.json) | JSON | 50 | 0 | 1 | 51 |
| [routes/auth.ts](/routes/auth.ts) | TypeScript | 60 | 6 | 15 | 81 |
| [routes/cluster.ts](/routes/cluster.ts) | TypeScript | 26 | 1 | 6 | 33 |
| [routes/community.ts](/routes/community.ts) | TypeScript | 130 | 14 | 18 | 162 |
| [routes/index.ts](/routes/index.ts) | TypeScript | 6 | 1 | 3 | 10 |
| [routes/service.ts](/routes/service.ts) | TypeScript | 65 | 5 | 9 | 79 |
| [routes/verify.ts](/routes/verify.ts) | TypeScript | 30 | 0 | 6 | 36 |
| [schema/Cluster.ts](/schema/Cluster.ts) | TypeScript | 35 | 0 | 3 | 38 |
| [schema/Community.ts](/schema/Community.ts) | TypeScript | 23 | 0 | 2 | 25 |
| [schema/Device.ts](/schema/Device.ts) | TypeScript | 39 | 0 | 3 | 42 |
| [schema/Invitation.ts](/schema/Invitation.ts) | TypeScript | 18 | 0 | 2 | 20 |
| [schema/Service.ts](/schema/Service.ts) | TypeScript | 39 | 0 | 4 | 43 |
| [schema/User.ts](/schema/User.ts) | TypeScript | 42 | 0 | 3 | 45 |
| [services/clusterManager.ts](/services/clusterManager.ts) | TypeScript | 84 | 1 | 9 | 94 |
| [services/dataManager.ts](/services/dataManager.ts) | TypeScript | 69 | 5 | 12 | 86 |
| [services/mapper.ts](/services/mapper.ts) | TypeScript | 20 | 0 | 2 | 22 |
| [services/scheduler.ts](/services/scheduler.ts) | TypeScript | 65 | 0 | 9 | 74 |
| [services/validation.ts](/services/validation.ts) | TypeScript | 25 | 0 | 9 | 34 |
| [tsconfig.json](/tsconfig.json) | JSON with Comments | 12 | 81 | 9 | 102 |
| [tslint.json](/tslint.json) | JSON | 12 | 0 | 0 | 12 |

[summary](results.md) / [details](details.md) / [diff summary](diff.md) / diff details