export class ItemLock {
    constructor(val, timeout) {
        this.inUse = false;
        this.val = val;
        this.timeout = timeout;
        this.timer = null;
    }

    async release() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.inUse = false;
    }
}

export class MapLock {
    constructor() {
        this.locks = new Map();
    }

    async set(key, val) {
        if (this.locks.has(key)) {
            throw new Error(`Lock [${key}] already exists`);
        } else {
            this.locks.set(key, new ItemLock(val));
        }
    }

    async setMany(items) {
        for (const [key, val] of Object.entries(items)) {
            try {
                await this.set(key, val);
            } catch (err) {
                await this.destroyAll();
                throw err;
            }
        }
    }

    async destroy(key) {
        if (this.locks.has(key)) {
            const item = this.locks.get(key);
            await item.release();
            this.locks.delete(key);
        }
    }

    async destroyAll() {
        for (const key of this.locks.keys()) {
            this.destroy(key);
        }
    }

    async lock(key, timeout) {
        if (!this.locks.has(key)) {
            throw new Error(`Lock [${key}] does not exist`);
        } else {
            const item = this.locks.get(key);
            if (item.inUse) {
                throw new Error(`Lock [${key}] is in use`);
            }

            item.inUse = true;

            if (timeout > 0) {
                item.timeout = timeout;
                item.timer = setTimeout(() => {
                    if (this.locks.has(key)) {
                        const il = this.locks.get(key);
                        if (il.timer) {
                            il.release();
                        }
                    }
                }, timeout);
            }

            return item;
        }
    }

    async try(key) {
        if (!this.locks.has(key)) {
            throw new Error(`Lock [${key}] does not exist`);
        } else {
            const item = this.locks.get(key);
            if (item.inUse) {
                throw new Error(`Lock [${key}] is in use`);
            }
        }
    }
}

// Demo usage
const demoMapLock = async () =>{
    const k8sLinks = {
        'k8s-a': {},
        'k8s-b': {},
        'k8s-c': {}
    };

    const ml = new MapLock();

    try {
        await ml.setMany(k8sLinks);
    } catch (err) {
        console.error(err.message);
        return;
    }

    try {
        await ml.try('k8s-a');
    } catch (err) {
        console.error(err.message);
        return;
    }

    let lock;
    try {
        lock = ml.lock('k8s-a', 10000); // 10 seconds
    } catch (err) {
        console.error(err.message);
        return;
    }

    // Business logic...

    lock.release();
}

await demoMapLock();