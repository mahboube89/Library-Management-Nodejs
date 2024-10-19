"use strict";

const http = require("http");
require("dotenv").config(); 

const bookController = require("./controllers/bookController");
const loanController = require("./controllers/loanController");
const userController = require("./controllers/userController");


// Create the server
const server = http.createServer((req, res) => {

    // Handle GET request for users
    if (req.method === "GET" && req.url === "/api/users") {
       userController.getAllUsers(req, res);
    }

    // Handle GET request for fetching all books
    else if (req.method === "GET" && req.url === "/api/books") {
        bookController.getAllBooks(req, res);
    }

    // Handle DELETE request for removing a book by ID
    else if (req.method === "DELETE" && req.url.startsWith("/api/books")) {
        bookController.removeBookById(req, res);
    }

    // Handle POST request to loan a book
    else if(req.method === "POST" && req.url.startsWith("/api/books/loan")) {
        loanController.loanBook(req, res);       
    }

    // Handle POST request for adding a book
    else if (req.method === "POST" && req.url.startsWith("/api/books")) {
        bookController.addBook(req, res);
    }

    // Handle PUT request to return a book
    else if(req.method === "PUT" && req.url.startsWith("/api/books/return")) {
        loanController.returnBook(req, res);
    }

    // Handle PUT request for editing a book
    else if (req.method === "PUT" && req.url.startsWith("/api/books")) {
       bookController.editBook(req,res);
    }

    // Handle POST request to login a user
    else if (req.method === "POST" && req.url.startsWith("/api/users/login")) {
        userController.loginUser(req,res);
    }

    // Handle POST request for adding a user
    else if (req.method === "POST" && req.url.startsWith("/api/users")) {
        userController.addUser(req, res);
    }
    
    // Handle PUT request for updating role to ADMIN
    else if(req.method === "PUT" && req.url.match(/\/api\/users\/[a-f\d]{24}\/upgrade/)) {
        userController.makeAdmin(req, res);
    }

    // Handle PUT request for update penalty for a user
    // [a-f\d]{24}: This matches a 24-character string consisting of hexadecimal digits (the format used for MongoDB ObjectIds)
    else if(req.method === "PUT" && req.url.match(/\/api\/users\/[a-f\d]{24}\/penalty/)) {
        userController.updatePenalty(req, res);
    }

    // Handle PUT request for update user info
    else if(req.method === "PUT" && req.url.startsWith("/api/users")) {
        userController.updateUserInfo(req, res);
    }
 
});

// Start the server on port 4000
server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}.`);

});