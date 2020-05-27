![Moleculer logo](https://moleculer.services/images/banner.png)

# moleculer-db-adapter-typeorm-mongo [![NPM version](https://img.shields.io/npm/v/moleculer-db-adapter-typeorm-mongo.svg)](https://www.npmjs.com/package/moleculer-db-adapter-typeorm-mongo)



MongoDB adapter for Moleculer DB service with [typeorm](https://github.com/typeorm/typeorm). Still a work in progress but stable.

Essentially a clone and modification of the great work on adaptor for [Sequelize](https://github.com/moleculerjs/moleculer-db/tree/master/packages/moleculer-db-adapter-sequelize) by the author of the project and [dkuida](https://github.com/dkuida/moleculer-db-adapter-typeorm).


it covers only the basics - but when you need more than basics just use the exposed

```javascript 1.8
service.adapter.repository;
```

# Features

- Standard and multi-tenancy database connecitons
- Create additional named typeorm connections in a service
- List databases from a connection

# Install

```bash
$ npm install moleculer-db-adapter-typeorm-mongo --save
```


## Usage

```js

/**
 * TypeORM db connection
 */
adapter: new TypeOrmDbAdapter({
    database: serviceDB,
    name: serviceName,
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    entities: [serviceEntity],
    synchronize: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}),

/**
 * TypeORM db model
 */
model: Entity,

/**
 * Service db connection mode
 * Either 'mt' for multitenant or 'stanard' for standard connection
 * string is case insensative.
 */
mode: 'standard',

```

# Todo

- gridfs integration for file / image storage in MongoDB

# Test
```
$ npm test
```

# License
The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).
