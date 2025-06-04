import {LibraryService} from "./LibraryService.js";
import {Book, BookGenres, BookStatus} from "../model/Book.js";
import {pool} from "../config/libConfig.js";

export class LibraryServiceImplSQL implements LibraryService{
    async addBook(book: Book): Promise<boolean> {
        const result = await pool.query('INSERT INTO books VALUES(null,?,?,?,?,?)', [book.title, book.author, book.genre, book.status, book.id])
        // const result = await pool.query('INSERT INTO books VALUES(1,"234-rtty-12", "Duna", "Herbert", "fantasy", "on_stock")')
        if(!result)
        return Promise.resolve(false);
        return Promise.resolve(true);
    }

    async getAllBooks(): Promise<Book[]> {
        const [result] = await pool.query('SELECT * FROM books')

        return Promise.resolve(result as unknown as Book[]);
    }

    async getBooksByGenre(genre: BookGenres): Promise<Book[]> {
        const query = 'SELECT * FROM books WHERE genre = ?';
        const value = [genre]
        const [result] = await pool.query(query, value);
        return Promise.resolve(result as Book[]);
    }

    async getBooksByGenreAndStatus(gen: string, st: string): Promise<Book[]> {
        const query = 'SELECT * FROM books WHERE genre = ? AND status = ?';
        const value = [gen, st]
        const [result] = await pool.query(query, value);
        return Promise.resolve(result as Book[]);
    }

    async getBookById(id:string):Promise<Book> {
        const query = 'SELECT * FROM books WHERE book_id = ?';
        const value = [id]
        const [result] = await pool.query(query, value);
        const books = result as Book[];

        async function getPickRecordsByBookId(id: string) {
            const query = 'SELECT date, name as reader FROM books_readers as b_r JOIN readers as r ON b_r.readerID = r.reader_id WHERE bookID = ?'
            const [result] = await pool.query(query, [id])
            return result as {date: string, reader: string}[];
        }

        if(books.length){
            let queryedBook = books[0];
            const pickRecords:{date:string, reader:string}[] = await getPickRecordsByBookId(queryedBook.id)
            queryedBook.pickList = pickRecords;
            return Promise.resolve(queryedBook)
        }

        throw new Error(JSON.stringify({status: 404, message: `Book with id ${id} not found`}))
    }

    async pickUpBook(id: string): Promise<void> {
        const book = await this.getBookById(id);
        if(book.status!==BookStatus.ON_STOCK)
            throw new Error(JSON.stringify({status: 400, message: "Wrong book status"}))
        pool.query('UPDATE books SET status = "on_hand" WHERE book_id = ?', [id])
    }

    async removeBook(id: string): Promise<Book> {
        const book = await this.getBookById(id);
        book.status = BookStatus.REMOVED;
       pool.query('DELETE FROM books_readers WHERE bookID = ?', [book.id])
        pool.query('DELETE FROM books WHERE book_id = ?', [id])
        return Promise.resolve(book)
    }

    async returnBook(id: string, reader: string): Promise<void> {
        const book = await this.getBookById(id);
        if(book.status!==BookStatus.ON_HAND)
            throw new Error(JSON.stringify({status: 400, message: "Wrong book status"}))

        let queriedReader = await this.getReaderByName(reader);
        if(!book)
            throw new Error(JSON.stringify({status: 400, message:"Can't return book because this book or reader not exists"}))
        if(!queriedReader){
            await pool.query('INSERT INTO readers VALUES (null, ?)',[reader]);
            queriedReader = await this.getReaderByName(reader);
        }

            await pool.query('INSERT INTO books_readers(bookID, readerID, date) VALUES(?, ?, ?)',
                [book.id,queriedReader.reader_id, new Date().toDateString()]);
            pool.query('UPDATE books SET status = "on_stock" WHERE book_id = ?', [id])

    }

    private getReaderByName = async (reader: string) => {
        const query = 'SELECT * FROM readers WHERE name = ?'
        const [result] = await pool.query(query, [reader]);
        const readersArr = result as { reader_id: number, name: string }[];
        const [queriedReader] = readersArr;
        return queriedReader;
    }
}