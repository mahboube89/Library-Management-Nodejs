"use strict";

const fs = require("fs");
const path = require("path");
const dbPath = path.join(__dirname, "../db.json");


// Function to read the database (db.json) file
const readDb = () => {
    return new Promise((resolve, reject) => {

        // Read the db.json file
        fs.readFile(dbPath, "utf-8", (err, data)=> {
            if (err) reject(err); // Reject the promise if there is an error
            resolve(JSON.parse(data)); // Parse and resolve the data if successful
        });
    });
};


// Function to write to the database (db.json) file
const writeDb = (data) => {
    return new Promise((resolve, reject) => {
        
        // Write the updated data to db.json
        fs.writeFile(dbPath, JSON.stringify(data, null, 2), (err) => {       
            if (err) reject(err); // Reject the promise if there is an error

            resolve(); // Resolve the promise if the write is successful   
        });
    });
};


// Fetch all books from the database
const fetchAllBooks = async () => {
    const db = await readDb(); // Read the database
    return db.books; // Return the list of books
};


// Find a specific book by its ID
const findBookById = async(bookId)=> {
    const db = await readDb(); // Read the database

    // Find and return the book with the matching ID
    return db.books.find((book) => book.id === bookId);
};


// Add a new book to the database
const addBook = async (newBook) => {
    const db = await readDb(); // Read the database

    // Add the new book to the books array
    db.books.push(newBook);
    await writeDb(db); // Write the updated database back to db.json

};


// Remove a book from the database by its ID
const removeBookById = async (bookId) => {
    const db = await readDb(); // Read the database

    // Filter out the book with the matching ID
    const bookToRemove = db.books.find((book) => book.id === bookId);
    
    // If no books were removed, it means the book wasn't found
    if (!bookToRemove) {
        throw new Error("Book not found");
    }

    const newBooks = db.books.filter((book) => book.id !== bookId)

    // Write the updated books array back to the database
    await writeDb({ ...db, books: newBooks});
    return bookToRemove;   
};


// Update the availability status of a book
const updateBookAvailability = async(bookId, availability) => {

    const db = await readDb(); // Read the database

    // Find the book with the matching ID
    const book = db.books.find((book) => book.id === bookId);

    // If the book exists, update its availability
    if (book) {
        book.is_available = availability; // Update the is_available property
        await writeDb(db); // Write the updated database back
        return book; // Return the updated book

    } else {

        // If the book is not found, throw an error
        throw new Error("Book not found");
    } 
};


// Edit the details of an existing book
const editBook = async (bookId, reqBody) => {

    const db = await readDb(); // Read the database

    // Find the book with the matching ID
    const book = db.books.find((book) => book.id === bookId.trim());

    console.log("found book:", book); // undefined
    

    // If the book exists, update its details
    if (book) {

        // Update the book details
        if(reqBody.title) book.title = reqBody.title; // Update title if provided
        if(reqBody.author) book.author = reqBody.author; // Update author if provided
        if(reqBody.price) book.price = reqBody.price; // Update price if provided

        await writeDb(db); // Write the updated database back
        return book; // Return the updated book

    } else {
        
        // If the book is not found, throw an error
        throw new Error("Book not found.");
    }
};


module.exports = {
    fetchAllBooks,
    findBookById,
    updateBookAvailability,
    addBook,
    removeBookById,
    editBook
}
