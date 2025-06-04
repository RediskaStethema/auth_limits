import {AccountService} from "../service/AccountService.js";
import {Request, Response, NextFunction} from "express";
import bcrypt from "bcryptjs";
import {AuthRequest, Role} from "../utils/libTypes.js";

 export async function basicAuth(header: string, req: AuthRequest, service: AccountService) {
    const BASIC = "Basic ";
    const authToken = Buffer.from(header.substring(BASIC.length), 'base64').toString('ascii');
    console.log(authToken);
    const [username, password] = authToken.split(":")
    if(username === process.env.OWNER && password === process.env.OWNER_PASS) {
        req.username = "GOD";
        req.roles = [Role.ROOT_ADMIN];
    } else
        try {
        const account = await service.getAccount(username);
        if(bcrypt.compareSync(password,account.passHash)){
            req.username = username;
            req.roles = account.roles;
            console.log("reader authenticated")
        }
    } catch (e) {
        console.log("reader not authenticated")
    }

}

export const authenticate = (service:AccountService) =>
async (req: Request, res: Response, next: NextFunction) => {
    const header = req.header('Authorization');
    console.log(header);
    if (header) {
        await basicAuth(header, req, service)
    }
    next();
}

export const skipRoutes = (skipRoutes:string[]) =>
    (req:AuthRequest, res:Response,next:NextFunction) => {
    const pathMethod = req.method + req.path;
        console.log(pathMethod)
    if(!skipRoutes.includes(pathMethod) && !req.username)
        throw new Error(JSON.stringify({status:401, message:""}))
    else next();
}