import {AccountService} from "./AccountService.js";
import {Reader} from "../model/Reader.js";
import {ReaderModel} from "../model/ReaderMongo.js";
import {Error} from "mongoose";
import {Role} from "../utils/libTypes.js";
import {Book} from "../model/Book.js";
import {BookModel} from "../model/BookMongo.js";



export class AccountServiceImplMongo implements AccountService{

    async addAccount(reader: Reader): Promise<void> {
        const temp = await ReaderModel.findOne({readerId: reader.readerId});

        if(temp) throw new Error(JSON.stringify({status: 409, message: `User ${reader.readerId} already exists`}))
            const readerDoc = new ReaderModel(reader);
            await readerDoc.save();
        }


    async getAccount(userName: string): Promise<Reader> {
        const reader = await ReaderModel.findOne({readerId: userName});
        if(!reader) throw new Error(JSON.stringify({status: 404, message: `User ${userName} not found`}))
        return Promise.resolve(reader);
    }

    async removeAccount(userName: string): Promise<Reader> {
        const reader = await ReaderModel.findOneAndDelete({readerId: userName});
        if (!reader) throw new Error(JSON.stringify({status: 404, message: `Reader ${userName} not found`}))
        return reader as Reader
    }

    async updateAccount(reader: Reader): Promise<void> {
       const result = await ReaderModel.updateOne({readerId:reader.readerId}, reader)
        if(!result.modifiedCount) throw new Error(JSON.stringify({status: 404, message: `Reader ${reader.readerId} not found`}))
    }

    async updateRoles(userName: string, body: Role[]): Promise<Reader> {
        const roles = body;
        const reader =
        // await  this.getAccount(userName)
        // reader.roles = roles;
        // console.log(reader)
        // const readerDoc = new ReaderModel(reader);
        // await readerDoc.save();
            // await this.updateAccount(reader)
             await ReaderModel.findOneAndUpdate({readerId: userName}, {$set: {roles}})
        if(!reader) throw new Error(JSON.stringify({status: 404, message: `Reader ${userName} not found`}))

        return reader as Reader;
    }

   /* async getaccby_book(bookname: string): Promise<Reader[]> {
        const books = await BookModel.find({ title: bookname }).lean();
        const readerIds = books.flatMap(book => book.pickList.map(record => record.reader));
        const uniqueReaderIds = [...new Set(readerIds)] as string[];
        let arrays:Reader[] = [];
        let temp
        for(let i=0; i<uniqueReaderIds.length; i++) {
            temp = await ReaderModel.find({readerId: uniqueReaderIds[i]}) as unknown as Reader;
            if (!temp) throw new Error(JSON.stringify(`problem with readers`));
            arrays.push(temp);
        }
        return arrays;

    }

    */

    async getaccby_book(bookname: string): Promise<Reader[]> {
        const books = await BookModel.find({ title: bookname }).lean();
        const readerIds = books.flatMap(book => book.pickList.map(record => record.reader));
        const uniqueReaderIds = [...new Set(readerIds)];
        const readers = await ReaderModel.find({ _id: { $in: uniqueReaderIds } });

        if (!readers || readers.length === 0) {
            throw new Error(`No readers found for book "${bookname}"`);
        }

        return readers;
    }

}