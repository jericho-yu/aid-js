export class Visit {
    constructor() {
        this.lastVisit = new Date();
        this.visitTimes = 1;
    }

    /**
     * 获取最后访问
     * @returns {Promise<Date>}
     */
    async getLastVisit() {
        return this.lastVisit;
    }

    /**
     * 获取访问次数
     * @returns {Promise<number>}
     */
    async getVisitTimes() {
        return this.visitTimes;
    }

    /**
     * 增加访问次数
     * @returns {Promise<void>}
     */
    async incrementVisitTimes() {
        this.visitTimes++;
    }

    /**
     * 重置访问次数
     * @returns {Promise<void>}
     */
    async resetVisitTimes() {
        this.visitTimes = 1;
    }

    /**
     * 更新最后访问
     * @returns {Promise<void>}
     */
    async updateLastVisit() {
        this.lastVisit = new Date();
    }
}

export class IpLimiter {
    constructor() {
        this.visitMap = new Map();
    }

    /**
     * 确认是否通行
     * @param ip
     * @param duration
     * @param maxVisitTimes
     * @returns {Promise<boolean[]|(any|boolean)[]>}
     */
    async affirm(ip, duration, maxVisitTimes) {
        if (maxVisitTimes === 0 || duration === 0) {
            return [null, true];
        }

        let visit = this.visitMap.get(ip);
        const now = new Date();

        if (!visit) {
            visit = new Visit();
            this.visitMap.set(ip, visit);
        } else {
            const timeSinceLastVisit = now - await visit.getLastVisit();
            if (timeSinceLastVisit > duration) {
                await visit.resetVisitTimes();
            } else if (await visit.getVisitTimes() > maxVisitTimes) {
                return [visit, false];
            } else {
                await visit.incrementVisitTimes();
            }
            await visit.updateLastVisit();
        }

        return [null, true];
    }
}


