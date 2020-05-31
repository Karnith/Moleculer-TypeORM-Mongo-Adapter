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
 * @name Moleculer typeorm mongo adapter
 * @module Service
 *
 */
export class TypeOrmDbAdapter<T> {
	public broker: ServiceBroker;
	public service: Service;
	public repository: MongoRepository<T>;
	public connection: Connection;
	public connectionMngr: ConnectionManager;
	private entity: EntitySchema<T>;
	private opts: ConnectionOptions;

	/**
	 * Create an instance of TypeOrmDBAdapter
	 * @param opts
	 */
	constructor(opts: ConnectionOptions) {
		this.opts = opts;
	}

	/**
	 * Initialize adapter
	 *
	 * @param broker
	 * @param service
	 *
	 */
	public init(broker: ServiceBroker, service: Service) {
		this.broker = broker;
		this.service = service;
		const entityFromService = this.service.schema.model;
		const isValid = !!entityFromService.constructor;
		if (!isValid) {
			throw new Error('if model is provided - it should be a typeorm repository');
		}
		this.entity = entityFromService;
	}

	/**
	 * Entity find
	 *
	 * @actions
	 *
	 * @param filters
	 *
	 */
	public async find(filters: any) {
		return this.createCursor(filters, false);
	}

	/**
	 * Entity fineone
	 *
	 * @param query
	 *
	 */
	public async findOne(query: FindOneOptions) {
		return this.repository.findOne(query);
	}

	/**
	 * Entity find by id
	 *
	 * @param id
	 *
	 */
	public async findById(id: string) {
		const objectIdInstance = PlatformTools.load('mongodb').ObjectID;
		return this.repository
			.findByIds([new objectIdInstance(id)])
			.then(async (result) => Promise.resolve(result[0]));
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		// return this.repository.findOne(new entity(), { id: id });
	}

	/**
	 * Entity find by array of ids
	 *
	 * @param idList
	 *
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
	 * @param filters
	 *
	 */
	public async count(filters = {}) {
		return this.createCursor(filters, true);
	}

	/**
	 * Entity insert
	 *
	 * @param entity
	 *
	 */
	public async insert(entity: any) {
		return this.repository.save(entity);
	}

	/**
	 * Entity create
	 *
	 * @param entity
	 *
	 */
	public async create(entity: any) {
		return this.insert(entity);
	}

	/**
	 * Entity insert array of objects
	 *
	 * @param entities
	 *
	 */
	public async insertMany(entities: any[]) {
		return Promise.all(entities.map((e) => this.repository.create(e)));
	}

	/**
	 * Entity update many
	 *
	 * @param where
	 * @param update
	 *
	 */
	public async updateMany(where: FindConditions<T>, update: DeepPartial<T>) {
		const criteria: FindConditions<T> = { where } as any;
		return this.repository.update(criteria, update as any);
	}

	/**
	 * Entity update by id
	 *
	 * @param id
	 * @param update
	 *
	 */
	public async updateById(id: string, update: { $set: DeepPartial<T> }) {
		const result = this.repository.update(id, update.$set as any);
		return result.then(() => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			update.$set.id = id;
			return update.$set;
		});
	}

	/**
	 * Entity remove many
	 *
	 * @param where
	 *
	 */
	public async removeMany(where: FindConditions<T>) {
		return this.repository.delete(where);
	}

	/**
	 * Entity remove by id
	 *
	 * @param id
	 *
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
		const mongoClient = (getConnection(this.opts.name).driver as any).queryRunner
			.databaseConnetion as MongoClient;
		const db: any = mongoClient.db(this.opts.database?.toString());
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
	 * @param mode
	 * @param options
	 * @param cb
	 *
	 */
	public async connect(mode: string, options: ConnectionOptions, cb: any) {
		if (mode.toLowerCase() === 'standard') {
			const connectionManager = getConnectionManager();
			const connectionPromise = connectionManager.create({
				type: 'mongodb',
				entities: [this.entity],
				synchronize: true,
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				useNewUrlParser: true,
				useUnifiedTopology: true,
				...this.opts,
			});
			const connection = await connectionPromise.connect();
			this.connection = connection;
			this.repository = this.connection.getMongoRepository(this.entity);
		}

		if (mode.toLowerCase() === 'mt') {
			if (!options) {
				const connectionManager = getConnectionManager();
				const connectionPromise = connectionManager.create({
					entities: [this.entity],
					...this.opts,
				});
				const connection = await connectionPromise.connect();
				this.connection = connection;
				this.connectionMngr = connectionManager;
				this.repository = this.connection.getMongoRepository(this.entity);
			} else {
				const connectionManager = getConnectionManager();
				const connectionPromise = connectionManager.create({
					...options,
				});
				await connectionPromise.connect();
				cb(getConnection(options.name));
			}
		}
	}

	/**
	 * Disconnect from database
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
	 * @param params
	 * @param isCounting
	 *
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
	 * need to simplify
	 * @param url database url
	 * @param connectionOpts database connection options
	 * @param username user name of user to be added
	 * @param password password of user to be added
	 * @param options additional options to be passed to add user
	 */
	public async addUser(
		url: string,
		connectionOpts: any,
		username: string,
		password: string,
		options?: object,
	) {
		return this._addUser(url, connectionOpts, username, password, options);
	}

	public async command(url: string, connectionOpts: any, command: string, options?: object) {
		return this._command(url, connectionOpts, command, options);
	}

	/**
	 * Create Database
	 *
	 * @param obj Database connection object
	 * @param userOpts User object if user to be added when db is created
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
		userOpts?: { [key: string]: any },
	) {
		return this._createDB(obj, userOpts);
	}

	/**
	 * List Databases on server
	 *
	 * @param url Mongodb url wihtout database
	 * @param opts Mondodb connection options
	 */
	public async listDataBases(url: string, opts: any) {
		return this._databaseList(url, opts);
	}

	public async removeUser(url: string, connectionOpts: any, username: string, options?: object) {
		return this._removeUser(url, connectionOpts, username, options);
	}

	/**
	 * Private methods
	 */

	/**
	 * Run query
	 * @param isCounting
	 * @param query
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
	 * @param params
	 * @param query
	 */
	private async _enrichWithOptionalParameters(params: any, query: FindManyOptions<T>) {
		if (params.search) {
			throw new Error('Not supported because of missing or clause meanwhile in typeorm');
		}

		if (params.sort) {
			const sort = this.transformSort(params.sort);
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
	 * @param paramSort
	 */
	private transformSort(paramSort: string | string[]): { [columnName: string]: 'ASC' | 'DESC' } {
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
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
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
	 * @param url URL of database conneciton
	 * @param connectionOpts Conneciton options for database
	 * @param username User name of user to be added to db
	 * @param password Password of user to be added to db
	 * @param options Additional options for create user.
	 */
	private async _addUser(
		url: string,
		connectionOpts: object,
		username: string,
		password: string,
		options?: object,
	) {
		const mongodbdriver = this.connection.driver as any;
		const dbConnection = new mongodbdriver.mongodb.MongoClient(url, connectionOpts);
		const addUser = dbConnection
			.connect()
			.then(async (clientconn: any) =>
				clientconn
					.db()
					.admin()
					.addUser(encodeURIComponent(username), encodeURIComponent(password), options),
			)
			// .then((dbs: { databases: any }) => {
			// 	return dbs.databases;
			// })
			.finally(async () => {
				await dbConnection.close();
			});

		return addUser;
	}

	private async _command(url: string, connectionOpts: any, command: string, options?: object) {
		// todo
		const mongodbdriver = this.connection.driver as any;
		const dbConnection = new mongodbdriver.mongodb.MongoClient(url, connectionOpts);
		const dblist = dbConnection
			.connect()
			.then(async (clientconn: any) => clientconn.db().admin().command(command, options))
			.then((dbs: { databases: any }) => {
				return dbs.databases;
			})
			.finally(async () => {
				await dbConnection.close();
			});

		return dblist;
	}

	/**
	 * Create database
	 *
	 * @param obj connection object
	 * @param userOpts db user objct
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
		userOpts?: { [key: string]: any },
	) {
		const mongodbdriver = this.connection.driver as any;
		const dbConnection = new mongodbdriver.mongodb.MongoClient(obj.url, obj.connectionOpts);
		const dblist = dbConnection
			.connect()
			.then(async (clientconn: { db: (arg0: string, arg1?: any, arg2?: any) => any }) => {
				const newDb = clientconn.db(obj.databaseName, obj.topology, obj.options);
				await newDb.createCollection('test');
				if (userOpts) {
					await newDb.addUser(userOpts.DBUser, userOpts.DBPassword, userOpts.options);
				}
			})
			.finally(async () => {
				await dbConnection.close();
			});

		return dblist;
	}

	/**
	 * Private method to list databases in a server connection
	 *
	 * @param url Mongodb url wihtout database
	 * @param opts Mondodb connection options
	 */
	private async _databaseList(url: string, connectionOpts: any) {
		const mongodbdriver = this.connection.driver as any;
		const dbConnection = new mongodbdriver.mongodb.MongoClient(url, connectionOpts);
		const dblist = dbConnection
			.connect()
			.then((clientconn: any) => clientconn.db().admin().listDatabases())
			.then((dbs: { databases: any }) => {
				return dbs.databases;
			})
			.finally(() => {
				dbConnection.close();
			});

		return dblist;
	}

	private async _removeUser(
		url: string,
		connectionOpts: any,
		username: string,
		options?: object,
	) {
		const mongodbdriver = this.connection.driver as any;
		const dbConnection = new mongodbdriver.mongodb.MongoClient(url, connectionOpts);
		const removeUser = dbConnection
			.connect()
			.then((clientconn: any) => clientconn.db().admin().removeUser(username, options))
			.then((dbs: { databases: any }) => {
				return dbs.databases;
			})
			.finally(() => {
				dbConnection.close();
			});

		return removeUser;
	}
}
