import {NextFunction ,Response} from "express";
import {AuthRequest, Role} from "../utils/libTypes.js";
import {AccountService} from "../service/AccountService.js";
import {basicAuth} from "./authentication.js";


const REQUEST_LIMIT = 10;
const WINDOW_SIZE_MS = 60 * 1000;
const userRequestLog = new Map<string, number[]>()
export function asyncMiddleware(
    fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>
) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
}

export function rateLimiter(service: AccountService) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const header = req.header("Authorization");

        if (header && header.startsWith("Basic ")) {
            await basicAuth(header, req, service);
        }

        if (!req.username || !req.roles) {
            return res.status(401).json({ message: "Unauthorized: user data missing" });
        }

        if (req.roles.includes(Role.LIBRARIAN) || req.roles.includes(Role.ADMIN)) {
            return next();
        }

        if (req.roles.includes(Role.USER)) {
            const now = Date.now();
            const timestamps = userRequestLog.get(req.username) || [];
            const filtered = timestamps.filter((ts) => now - ts < WINDOW_SIZE_MS);
            filtered.push(now);
            userRequestLog.set(req.username, filtered);

            if (filtered.length > REQUEST_LIMIT) {
                return res.status(403).json({ message: "превышен лимит запросов в минуту для USER" });
            }

            return next();
        }

        return res.status(403).json({ message: "Недостаточно прав" });
    };
}