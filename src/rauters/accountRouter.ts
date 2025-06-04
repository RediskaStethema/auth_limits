import express, {Request, Response} from "express";
import asyncHandler from "express-async-handler";
import {readerAccountSchema, rolesArrSchema} from "../utils/joiSchemas.js";
import {AccountController} from "../controllers/AccountController.js";
import {ReaderDto} from "../model/ReaderDto.js";
import {AuthRequest, Role} from "../utils/libTypes.js";
import {Reader} from "../model/Reader.js";

export const  accountRouter = express.Router();
const controller = new AccountController();

accountRouter.post('/', asyncHandler(async (req:Request, res:Response) => {
    const body = req.body;
    const {error} = readerAccountSchema.validate(body);
    if(error) throw new Error(JSON.stringify({
        status: 400, message: error.message
    }));
    console.log(body)
    await controller.addReaderAccount(body as ReaderDto);
    res.status(201).send();
}));
accountRouter.get('/account/:username', asyncHandler(async (req:AuthRequest, res) => {

   // const roles = req.roles;
   // if(!roles || !roles.includes(Role.USER))
   //  res.status(403).send()
    const reader_dto = await controller.getReaderAccount(req.params.username as string);
   res.json(reader_dto)
}));
accountRouter.delete('/account/:username', asyncHandler(async (req, res) => {
    const reader = await controller.removeReaderAccount(req.params.username as string);
    res.json(reader)
}))
accountRouter.put('/', asyncHandler(async (req, res) => {
    const body = req.body;
    const {error} = readerAccountSchema.validate(body);
    if (error) throw new Error(JSON.stringify({
        status: 400, message: error.message
    }));
    console.log(body)
    await controller.updateReaderAccount(body as ReaderDto);
    res.send();
}))

accountRouter.put('/roles', asyncHandler(async (req: AuthRequest, res:Response) => {
    const {userName} = req.query;
    const body = req.body;
    const{error} = rolesArrSchema.validate(body)
    if(error) throw new Error(JSON.stringify({status: 400, message:error.message}) );

    const result:Reader = await controller.updateRoles(userName as string, body as Role[])
    res.json(result)
}))

accountRouter.get(`/readerBYB/:bookname`, asyncHandler(async (req: AuthRequest, res) => {
    const bookname= req.params.bookname as string;
    const reader=controller.getbybook(bookname);

}))
