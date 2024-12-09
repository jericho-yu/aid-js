import {IpLimiter} from "./ip_limiter.js";

export class RouteLimiter {
    constructor() {
        this.routeSetMap = new Map();
    }

    /**
     * 增加路由规则
     * @param route
     * @param duration
     * @param maxVisitTimes
     * @returns {Promise<RouteLimiter>}
     */
    async add(route, duration, maxVisitTimes) {
        this.routeSetMap.set(route, { ipLimiter: new IpLimiter(), duration, maxVisitTimes });
        return this;
    }

    /**
     * 确认是否通行
     * @param route
     * @param ip
     * @returns {Promise<[null,boolean]|[any,boolean]|boolean[]>}
     */
    async affirm(route, ip) {
        const routeConfig = this.routeSetMap.get(route);
        if (routeConfig) {
            return routeConfig.ipLimiter.affirm(ip, routeConfig.duration, routeConfig.maxVisitTimes);
        }
        return [null, true];
    }
}

// Usage example
const routeLimiter = new RouteLimiter();
await routeLimiter.add('/api', 60000, 5); // 1 minute duration, max 5 visits

const [visit, allowed] = await routeLimiter.affirm('/api', '192.168.1.1');
console.log(allowed); // true or false
