import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import {AccountServiceImplMongo} from "../service/AccountServiceImplMongo.js";
import {AccountService} from "../service/AccountService.js";
import {Role} from "../utils/libTypes.js";
import {LibraryService} from "../service/LibraryService.js";
import {LibraryServiceImplMongo} from "../service/LibraryServiceImplMongo.js";

export const PORT = 3500;
export const db = 'mongodb+srv://konspirin:2j51Z79bDwf8L2TA@cluster0.5rziody.mongodb.net/library?retryWrites=true&w=majority&appName=Cluster0'

dotenv.config();
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT? +process.env.DB_PORT : undefined,
    database: process.env.DB_NAME,
    user:process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

export const accService:AccountService = new AccountServiceImplMongo();
export const libService:LibraryService = new LibraryServiceImplMongo();

export const skipPaths = [
    'POST/accounts',
    'GET/api/books'
]

export const pathsRoles:Record<string, Role[]> = {
    'PUT/accounts' : [Role.USER, Role.ADMIN],
    'GET/accounts/account':[Role.USER, Role.ADMIN],
    'DELETE/accounts/account':[Role.ROOT_ADMIN],
    'PUT/accounts/roles':[Role.ROOT_ADMIN],
    //==========================================================
    'POST/api/books':[Role.LIBRARIAN,Role.ADMIN],
    'DELETE/api/books/remove':[Role.LIBRARIAN,Role.ADMIN],
    'PUT/api/books/pickup':[Role.LIBRARIAN],
    'PUT/api/books/return':[Role.LIBRARIAN],
    'GET/api/books/book':[Role.USER],
    'GET/api/books/genre':[Role.USER],
    'GET/api/books/genre/status':[Role.USER],



}