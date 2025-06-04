import {LibraryServiceImplEmbedded} from "../service/LibraryServiceImplEmbedded.js";
import {LibraryService} from "../service/LibraryService.js";
import {BookDto} from "../model/BookDto.js";
import {Book} from "../model/Book.js";
import {convertBookDtoToBook, convertBookToBookDto, getGenre, getStatus} from "../utils/tools.js";
import {LibraryServiceImplMongo} from "../service/LibraryServiceImplMongo.js";
import {LibraryServiceImplSQL} from "../service/LibraryServiceImplSQL.js";
import {libService} from "../config/libConfig.js";

export class BookController {
    // private libService:LibraryService = new LibraryServiceImplEmbedded();

   // private libService:LibraryService = new LibraryServiceImplSQL();

    async getAllBooks() {
        return libService.getAllBooks();
    }
    async addBook(dto: BookDto) {
        const book: Book = convertBookDtoToBook(dto);
        const result = await libService.addBook(book)
        if (result) {
            console.log(book)
            return book;
        }
        throw new Error(JSON.stringify({status: 403, message: `Book with id ${book.id} not added`}))
    }

    async removeBook(id: string) {
        const book = await libService.removeBook(id);
        return convertBookToBookDto(book);
    }

   async pickUpBook(id_book: string, id_reader: string) {
        await libService.pickUpBook(id_book, id_reader)
    }

    async returnBook(id: string, reader: string) {
        await libService.returnBook(id, reader)
    }

    async getBooksByGenre(genre: string) {
        const gen = getGenre(genre);
        const filteredBooks = await libService.getBooksByGenre(gen)
        return filteredBooks.map(book => convertBookToBookDto(book));
    }

    async getBooksByGenreAndStatus(genre: string, status: string):Promise<Book[]> {
        const gen = getGenre(genre);
        const st = getStatus(status);
        return await libService.getBooksByGenreAndStatus(gen, st);
    }

    async getBookById(id: string) {
        return await libService.getBookById(id);
    }
}
