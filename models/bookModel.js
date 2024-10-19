"use strict";

const { db } = require("./../configs/db");
const { ObjectId } = require("mongodb");


// Fetch all books from the database
const fetchAllBooks = async () => {

    try {
        
        // Establish connection to the database
        const database = await db();
        const booksCollection = database.collection("books"); // Access the "books" collection
    
        const books = await booksCollection.find({}).toArray();
    
        return books; // Return the list of books

    } catch (error) {
        throw new Error('Failed to fetch books from the database.');
    }
};


// Find a specific book by its ID
const findBookById = async(bookId)=> {

    try {
        
        // Establish connection to the database
        const database = await db();
        const booksCollection = database.collection("books"); // Access the "books" collection
    
        // Convert the bookId to ObjectId
        const objectId = new ObjectId(bookId);
    
        const book = await booksCollection.findOne({ _id: objectId});
    
        if (!book) {
            throw new Error('Book not found.');
        }   
        return book;

    } catch (error) {
        throw new Error('Failed to fetch the book by ID.');
    }
};


// Add a new book to the database
const addBook = async (bookData) => {

    try {
        
        // Establish connection to the database
        const database = await db(); 
        const booksCollection = database.collection("books"); // Access the "books" collection
    
        // Set the timestamps
        const timestamp = new Date();
    
        const newBook = {
            ...bookData,
            is_available:1, // Set the book as available by default
            created_at: timestamp, // Set the current time as the creation time
            updated_at: timestamp, // Initially, updated_at is the same as created_at
        };
    
        // Insert the book into the MongoDB collection
        const result = await booksCollection.insertOne(newBook);
        return result;

    } catch (error) {
        throw new Error('Failed to add the book.');
    }

};


// Remove a book from the database by its ID
const removeBookById = async (bookId) => {
    
    try {
        
        // Establish connection to the database
        const database = await db(); 
        const booksCollection = database.collection("books"); // Access the "books" collection
    
        // Convert the bookId to ObjectId
        const objectId = new ObjectId(bookId);
    
        const result = await booksCollection.deleteOne({ _id: objectId});
    
        if (result.deletedCount === 0) {
            throw new Error('Book not found.');
        } 

        return { message: "Book removed successfully." };
    
    } catch (error) {
        throw new Error('Failed to remove the book.');
    }
};


// Update the availability status of a book
const updateBookAvailability = async(bookId, availability) => {

    try {
        
        // Establish connection to the database
        const database = await db();
        const booksCollection = database.collection("books"); // Access the "books" collection
    
        // Convert the bookId to ObjectId
        const objectId = new ObjectId(bookId);
    
        // Update the 'is_available' status of the book
        const result = await booksCollection.updateOne(
            { _id: objectId},
            { $set: { is_available: availability}, }
        );

        if (result.modifiedCount === 0) {
            throw new Error('Failed to update book availability.');
        }

        return { message: "Book availability updated successfully." };

    } catch (error) {
        throw new Error('Failed to update book availability.');
    }
};


// Edit the details of an existing book
const editBook = async (bookId, bookData) => {

    try {
        
        // Establish connection to the database
        const database = await db(); 
        const booksCollection = database.collection("books"); // Access the "books" collection
        
        // Capture the current timestamp for the 'updated_at' field
        const timestamp = new Date();
    
        // Convert the bookId to ObjectId
        const objectId = new ObjectId(bookId);
    
        // Update the book with the provided data, and set the 'updated_at' field to the current timestamp
        const result = await booksCollection.updateOne(
            { _id: objectId}, // Find the book by its ID
            {
                $set: {
                    ...bookData,
                    updated_at: timestamp
                },
            }
        );
    
        if (result.matchedCount === 0) {
            throw new Error('Book not found.');
        }

        if (result.modifiedCount === 0) {
            return { message: "No changes were made to the book." };
        }

        return { message: "Book updated successfully." };

    } catch (error) {
        throw new Error('Failed to update the book.');
    }
};


module.exports = {
    fetchAllBooks,
    updateBookAvailability,
    addBook,
    findBookById,
    removeBookById,
    editBook
};
