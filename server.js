const http = require("http");
const fs = require("fs");
const url = require("url");

const db = require("./db.json");

// Create the server
const server = http.createServer((req, res) => {

    // Handle GET request for users
    if (req.method === "GET" && req.url === "/api/users") {
        // Read the database file (db.json)
        fs.readFile("db.json", (error, db) => {

            if (error) {
                throw error; // Handle error if file can't be read
            }

            // Parse the JSON content of the file
            const data = JSON.parse(db);

            // Set response headers
            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(JSON.stringify(data.users)); // Send users data as a response
            res.end(); // End the response

        });
    }

    // Handle GET request for fetching all books
    else if (req.method === "GET" && req.url === "/api/books") {
        // Read the database file (db.json)
        fs.readFile("db.json", (error, db) => {

            if (error) {
                throw error;
            }

            // Parse the JSON content of the file
            const data = JSON.parse(db);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(JSON.stringify(data.books)); // Send books data as a response
            res.end();

        });
    }

    // Handle DELETE request for removing a book by ID
    else if (req.method === "DELETE") {
        // Parse the request URL
        const parsedUrl = url.parse(req.url, true); 

        // Get the book ID from the query string and convert to integer
        const bookId = parseInt(parsedUrl.query.id);

        // Filter out the book with the matching ID
        const newBooks = db.books.filter((book) => book.id !== bookId);
        
        // Check if the book was not found (i.e., no books were removed)
        if (newBooks.length === db.books.length) {
            // Respond with a 404 status code if the book is not found
            res.writeHead(404, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "Book not found" }));
            res.end();
            return;
        }

        // Write the updated books array back to the db.json file
        fs.writeFile('db.json', JSON.stringify({ ...db, books: newBooks }), (err) => {
            
            if (err) {
                throw err;
            }

            // Respond with a success message after the book is removed
            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "Book removed successfully" }));
            res.end();
        });
    }

});

// Start the server on port 4000
server.listen(4000, () => {
    console.log("Server is running on port 4000.");

})