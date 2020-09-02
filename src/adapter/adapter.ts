/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * moleculer-db-adapter-typeorm-mongo
 * Copyright (c) 2020 Matthew Marino (https://github.com/Karnith/Moleculer-TypeORM-Mongo-Adapter)
 * MIT Licensed
 */
import {
	// createConnection,
	getConnectionManager,
	ConnectionOptions,
	Connection,
	EntitySchema,
	MongoRepository,
	FindOneOptions,
	DeepPartial,
	FindConditions,
	FindManyOptions,
	GridFSBucket,
	getConnection,
	MongoClient,
	ConnectionManager,
} from 'typeorm';
import { PlatformTools } from 'typeorm/platform/PlatformTools';
import fs from 'fs';
// import * as Moleculer from 'moleculer';
import { Service, ServiceBroker } from 'moleculer';
import assert from 'assert';

interface IndexMap {
	[key: string]: string;
}

/**
 * Mongo TypeORM Adapter
 *
 * @name moleculer-db-adapter-typeorm-mongo
 * @module Service
 * @class TypeOrmDbAdapter
 */
export class TypeOrmDbAdapter<T> {
	public broker: ServiceBroker;
	public service: Service;
	public repository: MongoRepository<T>;
	public connection: Connection;
	public connectionMngr: ConnectionManager;
	private _entity: EntitySchema<T>;
	private _opts: ConnectionOptions;

	/**
	 * Create an instance of TypeOrmDBAdapter
	 *
	 * @param {Object} opts
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	constructor(opts: ConnectionOptions) {
		this._opts = opts;
	}

	/**
	 * Initialize adapter
	 *
	 * @param broker service broker of service
	 * @param service service
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public init(broker: ServiceBroker, service: Service) {
		this.broker = broker;
		this.service = service;
		const entityFromService = this.service.schema.model;
		const isValid = !!entityFromService.constructor;
		if (!isValid) {
			throw new Error('if model is provided - it should be a typeorm repository');
		}
		this._entity = entityFromService;
	}

	/**
	 * Entity find
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {Object} filters - Filters object to apply
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async find(filters: any) {
		return this.createCursor(filters, false);
	}

	/**
	 * Entity fineone
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {Object} query - Query object
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async findOne(query: FindOneOptions) {
		return this.repository.findOne(query);
	}

	/**
	 * Entity find by id
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {String} id - id of document
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async findById(id: string) {
		const objectIdInstance = PlatformTools.load('mongodb').ObjectID;
		return this.repository
			.findByIds([new objectIdInstance(id)])
			.then(async (result) => Promise.resolve(result[0]));
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// return this.repository.findOne(new entity(), { id: id });
	}

	/**
	 * Entity find by array of ids
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {Array<Object|String>} idList - list of ids
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async findByIds(idList: any[]) {
		const objectIdInstance = PlatformTools.load('mongodb').ObjectID;
		const idArray: any[] = idList.map((id) => {
			return id instanceof objectIdInstance ? id : new objectIdInstance(id);
		});
		return this.repository.findByIds(idArray);
	}

	/**
	 * Entity count
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {Object} filters - Object of filters to apply
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async count(filters = {}) {
		return this.createCursor(filters, true);
	}

	/**
	 * Entity insert
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {Object} entity - docuemnt to save
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async insert(entity: any) {
		return this.repository.save(entity);
	}

	/**
	 * Entity create
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {Object} entity - document to create
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async create(entity: any) {
		return this.insert(entity);
	}

	/**
	 * Entity insert array of objects
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {Array<Object>} entities - Array of entities
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async insertMany(entities: any[]) {
		return Promise.all(entities.map((e) => this.repository.create(e)));
	}

	/**
	 * Entity update many
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {Promise} where - Promise Object filter
	 * @param {Promise} update - Promise Object update deep partial
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async updateMany(where: FindConditions<T>, update: DeepPartial<T>) {
		const criteria: FindConditions<T> = { where } as any;
		return this.repository.update(criteria, update as any);
	}

	/**
	 * Entity update by id
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {String} id - id of document
	 * @param {Object} update - update object using deep partial
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async updateById(id: string, update: DeepPartial<T>) {
		const result = this.repository.update(id, update);
		// return result.then(() => {
		// 	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// 	// @ts-ignore
		// 	update.$set.id = id;
		// 	return update.$set;
		// });
		return result;
	}

	/**
	 * Entity remove many
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {Promise} where - promise object filter
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async removeMany(where: FindConditions<T>) {
		return this.repository.delete(where);
	}

	/**
	 * Entity remove by id
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {String} id - id of document
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async removeById(id: string) {
		const result = this.repository.delete(id);
		return result.then(() => {
			return { id };
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public beforeSaveTransformID(entity: T, _idField: string) {
		return entity;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public afterRetrieveTransformID(entity: T, _idField: string) {
		return entity;
	}

	public saveLargFile(file: any) {
		const mongoClient = (getConnection(this._opts.name).driver as any).queryRunner
			.databaseConnetion as MongoClient;
		const db: any = mongoClient.db(this._opts.database?.toString());
		const bucket = new GridFSBucket(db);
		fs.createReadStream(file)
			.pipe(bucket.openUploadStream(file))
			.on('error', (error) => assert.ifError(error))
			.on('finish', () => {
				process.exit(0);
			});
	}

	/**
	 * Conect to database
	 *
	 * @methods
	 * @public
	 *
	 * @example
	 * ```js
	 * this.connect(); // connects to default db connection oof service
	 * // new connection object
	 * const newConnection = {
	 *	database: 'products',
	 *	type: String(process.env.DBENGINE),
	 *	username: process.env.MONGOUSERNAME,
	 *	password: process.env.MONGOPASSWORD,
	 *	host: process.env.DBHOST,
	 *	port: Number(process.env.DBPORT),
	 *	authSource: process.env.AUTHSOURCE,
	 *	appname: 'Cameo:service:testapiMT:Products',
	 *	entities: [Products],
	 *	synchronize: process.env.SYNCHRONIZE,
	 *	useNewUrlParser: process.env.USENEWURLPARSER,
	 *	useUnifiedTopology: process.env.USENEWURLPARSER,
	 * };
	 * const productsConnection = await new this.Promise(
	 *   async (resolve, reject) => {
	 *     // pass connection type, connection object and callback to retrieve the new connection object already connected
	 *     await this.connect('mt', newConnection, (conn) => {
	 *       if (!conn) {
	 *         return reject("can't create connection");
	 *       }
	 *	     // set new connection object to outside variable for use
	 *	     return resolve(conn);
	 *     });
	 *   }
	 * );
	 * // use new connection to query database
	 * await productsConnection.connection.connect();
	 * console.log(await productsConnection.connection.getMongoRepository(Products).find());
	 * // close connection when done
	 * await productsConnection.connection.close();
	 * // use manager (Connection manager) to get all the available connections
	 * console.log(productsConnection.manager);
	 * // get connection you want to use
	 * const connection = productsConnection.manager.get('products')
	 * console.log(connection);
	 * // opens connection
	 * connection.connect();
	 * {...}
	 * // closes connection
	 * connection.close();
	 * ```
	 *
	 * @param {String} mode mode of adapter, either mt or standard
	 * @param {Object} options connection options
	 * @param {Object} cb callback with connection in mt mode
	 *
	 * @returns {Connection|Repository|ConnectionManager} returns Connection, repository and connection manager
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public async connect(mode: string, options: ConnectionOptions, cb: any): Promise<void> {
		if (mode.toLowerCase() === 'standard') {
			const connectionManager = getConnectionManager();
			const connectionPromise = connectionManager.create({
				// type: 'mongodb',
				entities: [this._entity],
				synchronize: true,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				useNewUrlParser: true,
				useUnifiedTopology: true,
				...this._opts,
			});
			const connection = await connectionPromise.connect();
			this.connection = connection;
			this.repository = this.connection.getMongoRepository(this._entity);
		}

		if (mode.toLowerCase() === 'mt') {
			if (!options) {
				const connectionManager = getConnectionManager();
				const connectionPromise = connectionManager.create({
					entities: [this._entity],
					...this._opts,
				});
				const connection = await connectionPromise.connect();
				this.connection = connection;
				this.connectionMngr = connectionManager;
				this.repository = this.connection.getMongoRepository(this._entity);
			} else {
				const connectionManager = getConnectionManager();
				connectionManager.create({ ...options });
				/* const connectionPromise = connectionManager.create({
					...options,
				});
				// may need to remove, should probably remove..
				await connectionPromise.connect(); */
				cb({ connection: connectionManager.get(options.name), manager: connectionManager });
			}
		}
	}

	/**
	 * Disconnect from database
	 * @methods
	 *
	 * @public
	 *
	 * @example
	 * ```js
	 * this.disconnect(); // disconnects default service connection
	 * ```
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async disconnect() {
		if (this.connection) {
			return this.connection.close();
		}
		return Promise.resolve();
	}

	public async clear() {
		return this.repository.clear();
	}

	public entityToObject(entity: T) {
		return entity;
	}

	/**
	 * Create cursor
	 *
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {Object} params
	 * @param {Boolean} isCounting
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async createCursor(params: any, isCounting: boolean = false) {
		if (params) {
			const query: FindManyOptions<T> = {
				where: params.query || {},
			};
			this._enrichWithOptionalParameters(params, query);

			return this._runQuery(isCounting, query);
		}

		return this._runQuery(isCounting);
	}

	/**
	 * Database utils
	 */

	/**
	 * Add user to database
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param obj - Connection object
	 * @param {String} obj.url - Database url
	 * @param {Object} obj.connectionOpts - Database connection options
	 * @param obj.[key: string] - Additional Key pair paramaters
	 * @param userOpts - User object
	 * @param {String} userOpts.username - User name of user to be added
	 * @param {String} userOpts.password - Password of user to be added
	 * @param {Object} userOpts.options - Additional options to be passed to add user
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async addDBUser(
		obj: {
			[key: string]: any;
			url: string;
			connectionOpts: any;
		},
		userOpts: {
			[key: string]: any;
			username: string;
			password: string;
			options?: Record<string, unknown>;
		},
	) {
		return this._addDBUser(obj, userOpts);
	}

	/**
	 * Run database command
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param {String} url - Mongodb url
	 * @param {Object} connectionOpts - Mongodb connection options
	 * @param {Object} command - Command object to send
	 * @param {Object} options - Additional options to add
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async command(
		url: string,
		connectionOpts: Record<string, unknown>,
		command: Record<string, unknown>,
		options?: Record<string, unknown>,
	) {
		return this._command({
			url: url,
			connectionOpts: connectionOpts,
			command: command,
			options: options,
		});
	}

	/**
	 * Create Database
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * await this.adapter.createDB(
	 *	{
	 *	    url: `${process.env.URL}${tenantDB}?authSource=${process.env.AUTHSOURCE}`,
	 *	    connectionOpts: {
	 *	    useNewUrlParser: Boolean(process.env.USENEWURLPARSER),
	 *	    useUnifiedTopology: Boolean(process.env.USENEWURLPARSER),
	 *	},
	 *	databaseName: tenantDB,
	 *	},
	 *	{
	 *	    DBUser: ctx.params.db_username,
	 *	    DBPassword: ctx.params.db_password,
	 *	    options: { roles: ['dbOwner'] },
	 *	},
	 * );
	 * ```
	 *
	 * @param obj - Connection object
	 * @param {String} obj.url - Mongo db url
	 * @param {Object} obj.connectionOpts - Mongo connection options
	 * @param {String} obj.databaseName - Mongo db name
	 * @param userOpts - User object (optional)
	 * @param {String} userOpts.username - User name
	 * @param {String} userOpts.Password - User Password
	 * @param {Object} userOpts.options - User options
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async createDB(
		obj: {
			[key: string]: any;
			url: string;
			connectionOpts: any;
			databaseName: string;
			// topology?: object,
			// options?: object,
		},
		userOpts: {
			[key: string]: any;
			username?: string;
			password?: string;
			userOpts?: Record<string, unknown>;
		},
	) {
		return this._createDB(obj, userOpts);
	}

	public async dropDB(obj: {
		[key: string]: any;
		url: string;
		connectionOpts: any;
		databaseName: string;
		// topology?: object,
		// options?: object,
	}) {
		return this._dropDatabase(obj);
	}

	/**
	 * Get all users on db
	 * @public
	 *
	 * @param obj - Connection object
	 * @param {String} obj.url - Mongo db url
	 * @param {Object} obj.connectionOpts - Mongo connection options
	 * @param {String} obj.databaseName - Mongo db name
	 * @returns {Object} Users on database
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async getAllDBUsers(obj: {
		[key: string]: any;
		url: string;
		connectionOpts: any;
		databaseName: string;
		// topology?: object,
		// options?: object,
	}) {
		return this._getAllDBUsers(obj);
	}

	/**
	 * List Databases on server
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * console.log(
	 *    await this.adapter
	 *      .listDataBases(
	 *        `${process.env.URL}?authSource=${process.env.AUTHSOURCE}`,
	 *        {
	 *            useNewUrlParser: Boolean(process.env.USENEWURLPARSER),
	 *            useUnifiedTopology: Boolean(process.env.USENEWURLPARSER),
	 *        },
	 *    )
	 * );
	 * ```
	 *
	 * @param url Mongodb url wihtout database
	 * @param opts Mongodb connection options
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async listDataBases(url: string, opts: any) {
		return this._databaseList({ url: url, connectionOpts: opts });
	}

	/**
	 * Remove user from db
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param obj Database connection object
	 * @param userOpts User object if user to be removed
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async removeUser(
		obj: {
			[key: string]: any;
			url: string;
			connectionOpts: any;
		},
		userOpts: {
			[key: string]: any;
			username: string;
			options?: Record<string, unknown>;
		},
	) {
		return this._removeDBUser(obj, userOpts);
	}

	/**
	 * Update DB User
	 * @methods
	 * @public
	 * @example
	 * ```js
	 * todo example
	 * ```
	 *
	 * @param obj - Connection object
	 * @param {String} obj.url - Mongo db url
	 * @param {Object} obj.connectionOpts - Mongo connection options
	 * @param userOpts - User object
	 * @param {String} userOpts.username - User name
	 * @param {String} userOpts.Password - User Password
	 * @param {Object} userOpts.options - User options (roles)
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	public async updateDBUser(
		obj: {
			[key: string]: any;
			url: string;
			connectionOpts: any;
		},
		userOpts: {
			[key: string]: any;
			username: string;
			password: string;
			options?: Record<string, unknown>;
		},
	) {
		return this._updateDBUser(obj, userOpts);
	}

	/**
	 * Private methods
	 */

	/**
	 * Run query
	 *
	 * @private
	 *
	 * @param {Boolean} isCounting
	 * @param {Object} query
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	private async _runQuery(isCounting: boolean, query?: FindManyOptions<T>) {
		if (isCounting) {
			return this.repository.count(query);
		} else {
			return this.repository.find(query);
		}
	}

	/**
	 * Enrich With Optional Parameters
	 *
	 * @private
	 *
	 * @param {Object} params
	 * @param {Object} query
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	private async _enrichWithOptionalParameters(params: any, query: FindManyOptions<T>) {
		if (params.search) {
			throw new Error('Not supported because of missing or clause meanwhile in typeorm');
		}

		if (params.sort) {
			const sort = this._transformSort(params.sort);
			if (sort) {
				query.order = sort as any;
			}
		}

		if (Number.isInteger(params.offset) && params.offset > 0) {
			query.skip = params.offset;
		}

		if (Number.isInteger(params.limit) && params.limit > 0) {
			query.take = params.limit;
		}
	}

	/**
	 * Transform sort
	 *
	 * @private
	 *
	 * @param paramSort
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	private _transformSort(paramSort: string | string[]): { [columnName: string]: 'ASC' | 'DESC' } {
		let sort = paramSort;
		if (typeof sort === 'string') {
			sort = sort.replace(/,/, ' ').split(' ');
		}
		if (Array.isArray(sort)) {
			const sortObj: IndexMap = {};
			sort.forEach((s) => {
				if (s.startsWith('-')) {
					sortObj[s.slice(1)] = 'DESC';
				} else {
					sortObj[s] = 'ASC';
				}
			});
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			return sortObj;
		}

		if (typeof sort === 'object') {
			return sort;
		}
		return {};
	}

	/**
	 * Private add user method
	 *
	 * @private
	 *
	 * @param url - URL of database conneciton
	 * @param {Object} connectionOpts - Conneciton options for database
	 * @param {String} username - User name of user to be added to db
	 * @param {String} password - Password of user to be added to db
	 * @param {Object} options - Additional options for create user.
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	private async _addDBUser(
		obj: {
			[key: string]: any;
			url: string;
			connectionOpts: any;
		},
		userOpts: {
			[key: string]: any;
			username: string;
			password: string;
			options?: Record<string, unknown>;
		},
	) {
		const dbConnection = this._createDBConnection(obj);
		return dbConnection
			.connect()
			.then(async (clientconn: any) =>
				clientconn
					.db()
					.addUser(
						encodeURIComponent(userOpts.username),
						encodeURIComponent(userOpts.password),
						userOpts.options,
					),
			)
			.finally(async () => {
				await dbConnection.close();
			});
	}

	/**
	 * Run database command
	 * @private
	 *
	 * @param {String} url - Mongodb url
	 * @param {Object} connectionOpts - Mongodb connection options
	 * @param {Object} command - Commanf object to send
	 * @param {Object} options - Additional options to add
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	private async _command(obj: {
		url: string;
		connectionOpts: any;
		command: Record<string, unknown>;
		options?: Record<string, unknown>;
	}) {
		const dbConnection = this._createDBConnection(obj);
		return dbConnection
			.connect()
			.then(async (clientconn: any) =>
				clientconn.db().admin().command(obj.command, obj.options),
			)
			.finally(async () => {
				await dbConnection.close();
			});
	}

	/**
	 * Create database
	 *
	 * @private
	 *
	 * @param obj - Connection object
	 * @param {String} obj.url - Mongo db url
	 * @param {Object} obj.connectionOpts - Mongo connection options
	 * @param {String} obj.databaseName - Mongo db name
	 * @param userOpts - User object (optional)
	 * @param {String} userOpts.username - User name
	 * @param {String} userOpts.Password - User Password
	 * @param {Object} userOpts.options - User options
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	private async _createDB(
		obj: {
			[key: string]: any;
			url: string;
			connectionOpts: any;
			databaseName: string;
			// topology?: object,
			// options?: object,
		},
		userOpts?: {
			[key: string]: any;
			username?: string;
			password?: string;
			userOpts?: Record<string, unknown>;
		},
	) {
		const dbConnection = this._createDBConnection(obj);
		return dbConnection
			.connect()
			.then(async (clientconn: { db: (arg0: string, arg1?: any, arg2?: any) => any }) => {
				const newDb = clientconn.db(obj.databaseName, obj.topology, obj.options);
				if (userOpts) {
					await newDb.addUser(userOpts.DBUser, userOpts.DBPassword, userOpts.options);
				}
			})
			.finally(async () => {
				await dbConnection.close();
			});
	}

	/**
	 * Private method to list databases in a server connection
	 *
	 * @private
	 *
	 * @param {String} url - Mongodb url wihtout database
	 * @param {Object} connectionOpts - Mondodb connection options
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	private async _databaseList(obj: { url: string; connectionOpts: Record<string, unknown> }) {
		const dbConnection = this._createDBConnection(obj);
		return dbConnection
			.connect()
			.then((clientconn: any) => clientconn.db().admin().listDatabases())
			.then((dbs: { databases: any }) => {
				return dbs.databases;
			})
			.finally(() => {
				dbConnection.close();
			});
	}

	/**
	 * Private method to Drop database
	 * @private
	 *
	 * @param {String} url - Mongodb url wihtout database
	 * @param {Object} connectionOpts - Mondodb connection options
	 */
	private async _dropDatabase(obj: { url: string; connectionOpts: Record<string, unknown> }) {
		const dbConnection = this._createDBConnection(obj);
		return dbConnection
			.connect()
			.then((clientconn: any) => clientconn.db().admin().dropDatabase())
			.finally(() => {
				dbConnection.close();
			});
	}

	/**
	 * Get all users on db
	 *
	 * @private
	 *
	 * @param obj - Connection object
	 * @param {String} obj.url - Mongo db url
	 * @param {Object} obj.connectionOpts - Mongo connection options
	 * @returns {Array} users on db
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	private async _getAllDBUsers(obj: { [key: string]: any; url: string; connectionOpts: any }) {
		const dbConnection = this._createDBConnection(obj);
		return dbConnection
			.connect()
			.then(async (clientconn: any) => clientconn.db().command({ usersInfo: 1 }))
			.finally(async () => {
				await dbConnection.close();
			});
	}

	/**
	 * Private remove DB User
	 *
	 * @private
	 *
	 * @param obj - Connection object
	 * @param {String} obj.url - Mongo db url
	 * @param {Object} obj.connectionOpts - Mongo connection options
	 * @param userOpts - User object
	 * @param {String} userOpts.username - User name
	 * @param {String} userOpts.Password - User Password
	 * @param {Object} userOpts.options - User options
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	private async _removeDBUser(
		obj: {
			[key: string]: any;
			url: string;
			connectionOpts: any;
		},
		userOpts: { [key: string]: any; username: string; options?: Record<string, unknown> },
	) {
		const dbConnection = this._createDBConnection(obj);
		return dbConnection
			.connect()
			.then((clientconn: any) =>
				clientconn.db().removeUser(userOpts.username, userOpts.options),
			)
			.finally(() => {
				dbConnection.close();
			});
	}

	/**
	 * Update DB User
	 *
	 * @private
	 *
	 * @param obj - Connection object
	 * @param {String} obj.url - Mongo db url
	 * @param {Object} obj.connectionOpts - Mongo connection options
	 * @param userOpts - User object
	 * @param {String} userOpts.username - User name
	 * @param {String} userOpts.Password - User Password
	 * @param {Object} userOpts.options - User options (roles)
	 *
	 * @memberof TypeOrmDbAdapter
	 */
	private async _updateDBUser(
		obj: {
			[key: string]: any;
			url: string;
			connectionOpts: any;
		},
		userOpts: {
			[key: string]: any;
			username: string;
			password: string;
			options?: Record<string, unknown>;
		},
	) {
		const dbConnection = this._createDBConnection(obj);
		return dbConnection
			.connect()
			.then(async (clientconn: any) =>
				clientconn.db().command({
					createUser: userOpts.username,
					pwd: userOpts.password,
					// customData: { <any information> },
					roles: [userOpts.options],
				}),
			)
			.finally(async () => {
				await dbConnection.close();
			});
	}

	private _createDBConnection(obj: { url: string; connectionOpts: any }) {
		const mongodbdriver = this.connection.driver as any;
		const dbConnection = new mongodbdriver.mongodb.MongoClient(obj.url, obj.connectionOpts);
		return dbConnection;
	}
}
