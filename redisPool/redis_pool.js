import fs from 'fs';
import Redis from 'ioredis';
import yaml from 'js-yaml';
import collect from 'collect.js';

export class RedisPool {
	constructor(filename) {
		// 初始化 Redis 连接池
		const fileContents = fs.readFileSync(filename, 'utf8');
		this.config = yaml.load(fileContents);

		this.connections = new Map();

		collect(this.config.pool).
			each(c => {
				this.connections[c.key] = new Redis({
					host: this.config.host,
					port: this.config.port,
					db: c.dbNum,
					password: this.config.password,
				});
			});
	}

	_getKey(key) {
		return `${this.config.prefix}:${key}`;
	}

	getConnection(connName) {
		// 获取指定连接名称的 Redis 连接实例
		return this.connections.get(connName);
	}

	close(connName) {
		// 关闭指定名称的连接
		const connection = this.connections.get(connName);
		if (connection) {
			connection.disconnect();
			this.connections.delete(connName);
		}
	}

	clean() {
		// 清理连接池中的所有连接
		for (const [key, connection] of this.connections) {
			connection.disconnect();
		}
		this.connections.clear();
	}

	async set(connName, key, value) {
		// 设置指定连接名称的键值对
		const connection = this.connections.get(connName);
		if (connection) {
			await connection.set(this._getKey(key), value);
		}
	}

	async get(connName, key) {
		// 从 Redis 连接池中检索值
		const connection = this.connections.get(connName);
		if (connection) {
			return await connection.get(this._getKey(key));
		}
		return null;
	}
}

// 示例使用
(async () => {
	const redisPool = new RedisPool('./redisPool/redis.yaml');
	await redisPool.set('auth', 'key1', 'value1');
	const value = await redisPool.get('auth', 'key1');
	console.log(value);

	// 关闭单个连接
	redisPool.close('auth');

	// 清理所有连接
	redisPool.clean();
})();