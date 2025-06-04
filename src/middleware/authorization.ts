import {AuthRequest, Role} from "../utils/libTypes.js";
import {NextFunction, Response} from "express";
import {normalizePath} from "../utils/tools.js";

export const authorize = (arr:Record<string, Role[]>) =>
    (req: AuthRequest, res:Response, next: NextFunction) => {
    const pathMethod = req.method + normalizePath(req.path);
    const roles = req.roles;
    // if(!roles || arr[pathMethod].includes(roles)) //ToDo incorrect request for registration with user
    if(!roles || roles.some(item => arr[pathMethod].includes(item))) //ToDo incorrect request for registration with user
        next();
    else throw new Error(JSON.stringify({status: 403, message:""}))
    }