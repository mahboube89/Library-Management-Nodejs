"use strict";

const url = require("url");
const bookModel = require("../models/bookModel");


// Controller function to handle the GET request for fetching all books
const getAllBooks = async(req, res) => {

    // Fetch all books from the bookModel
    const books = await bookModel.fetchAllBooks();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(books)); // Send books data as a response
    res.end();

};


// Controller function to handle the DELETE request to remove a book by its ID
const removeBookById = async(req, res) => {
    // Parse the request URL
    const parsedUrl = url.parse(req.url, true); 
    
           
    // Get the book ID from the query string and convert to integer
    const bookId = parsedUrl.query.id;

    // Validate that bookId is provided
    if (!bookId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: "Book ID is required." }));
        res.end();
        return;
    }

    try {

        // Call the model to remove the book by its ID
        const removedBook = await bookModel.removeBookById(bookId);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(removedBook)); 
        res.end();

    } catch (err) {
        
        res.writeHead(404, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: err.message }));
        res.end();
    }  
};


// Controller function to handle the POST request to add a book 
const addBook = async (req, res) => {
    let book = ""

    // Receive incoming book data
    req.on("data", (data) => {
        book += data.toString();         
    });

    // Once the data has been fully received
    req.on("end", async ()=> {       

        try {

            // Parse the incoming JSON data
            const bookData = JSON.parse(book);
            
            // Validate required fields: 'title', 'author', and 'price'
            if(!bookData.title || !bookData.author || bookData.price == undefined) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Missing title, author, or price."}));
                res.end();
                return; // Stop further execution if validation fails
            }

            // Validate that price is a number and greater than 0
            if (typeof bookData.price !== "number" || bookData.price < 0) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Price must be a positive number."}));
                res.end();
                return;
            }

            const result = await bookModel.addBook(bookData);

            // Respond with success message
            res.writeHead(201, {"Content-Type": "application/json"});
            res.write(JSON.stringify({
                message: "New book added successfully.",
                bookId: result.insertedId
            
            }));
            res.end();

        } catch (err) {
            // Handle JSON parsing errors or other issues
            res.writeHead(400, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: "Invalid JSON data"}));
            res.end();
        }
        
    });

};


// Controller function to handle the PUT request to edit the details of a book
const editBook = async(req, res) => {

    // Extract the bookId from the query string
    const parsedUrl = url.parse(req.url, true);
    const bookId = parsedUrl.query.id;

    // Ensure the bookId is valid
    if (!bookId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: "Book ID is required." }));
        res.end();
        return;
    }

    // Collect incoming data
    let newBookDetails = "";

    req.on("data", (data) => {
        newBookDetails += data.toString();
    });

    req.on("end", async()=> {

        try {

            // Parse and update the book details
            const reqBody = JSON.parse(newBookDetails);

            // Ensure at least one field is provided to update
            if (Object.keys(reqBody).length === 0) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.write(JSON.stringify({ message: "No fields to update provided." }));
                res.end();
                return;
            };

            // Validate that price is a number and non-negative
            if (reqBody.price !== undefined && (typeof reqBody.price !== 'number' || reqBody.price < 0)) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.write(JSON.stringify({ message: "Price must be a non-negative number." }));
                res.end();
                return;
            }
            
            // Call the editBook function from the model and wait for it to complete
            const editedBook = await bookModel.editBook(bookId, reqBody);

            // Check if the update operation did not find a matching document
            if (editedBook.matchedCount === 0) {
                res.writeHead(404, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Book not found."}));
                res.end();
                return;
            }
            
            // Respond with success message
            res.writeHead(200, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: "Book updated successfully.", book: editedBook}));
            res.end();
            

        } catch (err) {
            res.writeHead(400, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: "Invalid JSON data."}));
            res.end();
        }

    });
};


module.exports = {
    getAllBooks,
    removeBookById,
    addBook,
    editBook
};