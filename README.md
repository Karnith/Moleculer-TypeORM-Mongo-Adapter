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


# Settings

<!-- AUTO-CONTENT-START:SETTINGS -->
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
*No settings.*

<!-- AUTO-CONTENT-END:SETTINGS -->

>**Note**: `idField` does not work with Sequelize adapter as you can freely set your own ID while creating the model.

<!-- AUTO-CONTENT-TEMPLATE:SETTINGS
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
{{#each this}}
| `{{name}}` | {{type}} | {{defaultValue}} | {{description}} |
{{/each}}
{{^this}}
*No settings.*
{{/this}}

-->

# Actions

<!-- AUTO-CONTENT-START:ACTIONS -->
<!-- AUTO-CONTENT-END:ACTIONS -->

<!-- AUTO-CONTENT-TEMPLATE:ACTIONS
{{#each this}}
## `{{name}}` {{#each badges}}{{this}} {{/each}}
{{#since}}
_<sup>Since: {{this}}</sup>_
{{/since}}

{{description}}

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
{{#each params}}
| `{{name}}` | {{type}} | {{defaultValue}} | {{description}} |
{{/each}}
{{^params}}
*No input parameters.*
{{/params}}

{{#returns}}
### Results
**Type:** {{type}}

{{description}}
{{/returns}}

{{#hasExamples}}
### Examples
{{#each examples}}
{{this}}
{{/each}}
{{/hasExamples}}

{{/each}}
-->

# Methods

<!-- AUTO-CONTENT-START:METHODS -->
## `find` 

Entity find

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `filters` | `Object` | **required** | Filters object to apply |


### Examples
```jstodo example```

## `findOne` 

Entity fineone

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `query` | `Object` | **required** | Query object |


### Examples
```jstodo example```

## `findById` 

Entity find by id

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `id` | `String` | **required** | id of document |


### Examples
```jstodo example```

## `findByIds` 

Entity find by array of ids

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `idList` | `Array.<(Object|String)>` | **required** | list of ids |


### Examples
```jstodo example```

## `count` 

Entity count

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `filters` | `Object` | **required** | Object of filters to apply |


### Examples
```jstodo example```

## `insert` 

Entity insert

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `entity` | `Object` | **required** | docuemnt to save |


### Examples
```jstodo example```

## `create` 

Entity create

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `entity` | `Object` | **required** | document to create |


### Examples
```jstodo example```

## `insertMany` 

Entity insert array of objects

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `entities` | `Array.<Object>` | **required** | Array of entities |


### Examples
```jstodo example```

## `updateMany` 

Entity update many

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `where` | `Promise` | **required** | Promise Object filter |
| `update` | `Promise` | **required** | Promise Object update deep partial |


### Examples
```jstodo example```

## `updateById` 

Entity update by id

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `id` | `String` | **required** | id of document |
| `update` | `Object` | **required** | update object using deep partial |


### Examples
```jstodo example```

## `removeMany` 

Entity remove many

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `where` | `Promise` | **required** | promise object filter |


### Examples
```jstodo example```

## `removeById` 

Entity remove by id

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `id` | `String` | **required** | id of document |


### Examples
```jstodo example```

## `connect` 

Conect to database

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `mode` | `String` | **required** | mode of adapter, either mt or standard |
| `options` | `Object` | **required** | connection options |
| `cb` | `Object` | **required** | callback with connection in mt mode |

### Results
**Type:** `Connection`, `Repository`, `ConnectionManager`

returns Connection, repository and connection manager

### Examples
```jsthis.connect(); // connects to default db connection oof service// new connection objectconst newConnection = {    database: 'products',    type: String(process.env.DBENGINE),    username: process.env.MONGOUSERNAME,    password: process.env.MONGOPASSWORD,    host: process.env.DBHOST,    port: Number(process.env.DBPORT),    authSource: process.env.AUTHSOURCE,    appname: 'Cameo:service:testapiMT:Products',    entities: [Products],    synchronize: process.env.SYNCHRONIZE,    useNewUrlParser: process.env.USENEWURLPARSER,    useUnifiedTopology: process.env.USENEWURLPARSER,};let productsConnection;// pass connection type, connection object and callback to retrieve the new connection object already connectedawait this.connect('mt', newConnection, (conn) => {    // set new connection object to outside variable for use    return (productsConnection = conn);});// sue new connection to query databaseconsole.log(await productsConnection!.getMongoRepository(Products).find());// close connection when doneawait productsConnection!.close();```

## `disconnect` 

Disconnect from database

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
*No input parameters.*


### Examples
```jsthis.disconnect(); // disconnects default service connection```

## `createCursor` 

Create cursor

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `params` | `Object` | **required** |  |
| `isCounting` | `Boolean` | `false` |  |


### Examples
```jstodo example```

## `addDBUser` 

Add user to database

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `obj` | any | **required** | Connection object |
| `obj.url` | `String` | **required** | Database url |
| `obj.connectionOpts` | `Object` | **required** | Database connection options |
| `obj.[key:` | any | **required** | string] - Additional Key pair paramaters |
| `userOpts` | any | **required** | User object |
| `userOpts.username` | `String` | **required** | User name of user to be added |
| `userOpts.password` | `String` | **required** | Password of user to be added |
| `userOpts.options` | `Object` | **required** | Additional options to be passed to add user |


### Examples
```jstodo example```

## `command` 

Run database command

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | `String` | **required** | Mongodb url |
| `connectionOpts` | `Object` | **required** | Mongodb connection options |
| `command` | `Object` | **required** | Command object to send |
| `options` | `Object` | **required** | Additional options to add |


### Examples
```jstodo example```

## `createDB` 

Create Database

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `obj` | any | **required** | Connection object |
| `obj.url` | `String` | **required** | Mongo db url |
| `obj.connectionOpts` | `Object` | **required** | Mongo connection options |
| `obj.databaseName` | `String` | **required** | Mongo db name |
| `userOpts` | any | **required** | User object (optional) |
| `userOpts.username` | `String` | **required** | User name |
| `userOpts.Password` | `String` | **required** | User Password |
| `userOpts.options` | `Object` | **required** | User options |


### Examples
```jsawait this.adapter.createDB(    {        url: `${process.env.URL}${tenantDB}?authSource=${process.env.AUTHSOURCE}`,        connectionOpts: {        useNewUrlParser: Boolean(process.env.USENEWURLPARSER),        useUnifiedTopology: Boolean(process.env.USENEWURLPARSER),    },    databaseName: tenantDB,    },    {        DBUser: ctx.params.db_username,        DBPassword: ctx.params.db_password,        options: { roles: ['dbOwner'] },    },);```

## `listDataBases` 

List Databases on server

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | any | **required** | Mongodb url wihtout database |
| `opts` | any | **required** | Mongodb connection options |


### Examples
```jsconsole.log(   await this.adapter     .listDataBases(       `${process.env.URL}?authSource=${process.env.AUTHSOURCE}`,       {           useNewUrlParser: Boolean(process.env.USENEWURLPARSER),           useUnifiedTopology: Boolean(process.env.USENEWURLPARSER),       },   ));```

## `removeUser` 

Remove user from db

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `obj` | any | **required** | Database connection object |
| `userOpts` | any | **required** | User object if user to be removed |


### Examples
```jstodo example```

## `updateDBUser` 

Update DB User

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `obj` | any | **required** | Connection object |
| `obj.url` | `String` | **required** | Mongo db url |
| `obj.connectionOpts` | `Object` | **required** | Mongo connection options |
| `userOpts` | any | **required** | User object |
| `userOpts.username` | `String` | **required** | User name |
| `userOpts.Password` | `String` | **required** | User Password |
| `userOpts.options` | `Object` | **required** | User options (roles) |


### Examples
```jstodo example```

<!-- AUTO-CONTENT-END:METHODS -->

<!-- AUTO-CONTENT-TEMPLATE:METHODS
{{#each this}}
## `{{name}}` {{#each badges}}{{this}} {{/each}}
{{#since}}
_<sup>Since: {{this}}</sup>_
{{/since}}

{{description}}

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
{{#each params}}
| `{{name}}` | {{type}} | {{defaultValue}} | {{description}} |
{{/each}}
{{^params}}
*No input parameters.*
{{/params}}

{{#returns}}
### Results
**Type:** {{type}}

{{description}}
{{/returns}}

{{#hasExamples}}
### Examples
{{#each examples}}
{{this}}
{{/each}}
{{/hasExamples}}

{{/each}}
-->

# License
The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).

# Contact
Copyright (c) 2020 Karnith