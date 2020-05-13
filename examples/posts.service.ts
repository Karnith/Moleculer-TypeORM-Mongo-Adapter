/* eslint-disable @typescript-eslint/no-explicit-any */
import { Post } from './Post';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as storeService from 'moleculer-db';
import { Action, Service } from 'moleculer-decorators';

import { TypeOrmDbAdapter } from '../src/adapter/adapter';

import moleculer, { Context } from 'moleculer';

const voteSchema = { id: { type: 'number' } };
@Service({
	adapter: new TypeOrmDbAdapter({
		database: 'memory',
		name: 'memory',
		type: 'sqlite',
	}),
	mixins: [storeService],
	model: Post,
	name: 'posts',
	settings: {
		fields: ['id', 'title', 'content', 'votes', 'status', 'author'],
		idField: 'id',
	},
})
export default class PostsService extends moleculer.Service {
	@Action({
		params: voteSchema,
	})
	public async vote(ctx: Context) {
		return (
			this.adapter
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				.findById(ctx.params.id)
				.then((post: any) => {
					post.votes++;
					return this.adapter.repository.save(post);
				})
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				.then(() => this.adapter.findById(ctx.params.id))
				.then((doc: any) => this.transformDocuments(ctx, ctx.params, doc))
		);
	}

	@Action({
		params: voteSchema,
	})
	public async unvote(ctx: moleculer.Context) {
		return (
			this.adapter
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				.findById(ctx.params.id)
				.then((post: any) => {
					post.votes--;
					return this.adapter.repository.save(post);
				})
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				.then(() => this.adapter.findById(ctx.params.id))
				.then((doc: any) => this.transformDocuments(ctx, ctx.params, doc))
		);
	}

	public afterConnected() {
		this.logger.info('Connected successfully');
		return this.adapter.clear();
	}
}
