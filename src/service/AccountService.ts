import {Reader} from "../model/Reader.js";
import {Role} from "../utils/libTypes.js";
import {Book} from "../model/Book.js";

export interface AccountService {
    addAccount: (reader:Reader) => Promise<void>;
    getAccount: (userName:string) => Promise<Reader>;
    updateAccount:(reader:Reader) => Promise<void>;
    removeAccount:(userName:string) => Promise<Reader>;
    updateRoles: (userName: string, roles: Role[]) => Promise<Reader>;
    getaccby_book:(bookname:string) => Promise<Reader[]>;
}