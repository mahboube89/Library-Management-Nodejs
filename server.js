const http = require("http");
const fs = require("fs");
const url = require("url");
const crypto = require("crypto");

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
    else if (req.method === "DELETE" && req.url.startsWith("/api/books")) {
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

    // Handle POST request for adding a book
    else if (req.method === "POST" && req.url.startsWith("/api/books")) {
        let book = ""

        // Receive incoming book data
        req.on("data", (data) => {
            book += data.toString();         
        });

        // Once the data has been fully received
        req.on("end", ()=> {
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

                // Create a new book object with a unique ID and 'is_available' flag set to 1
                const newBook = {id: crypto.randomUUID(), ...bookData, is_available: 1};

                // Add the new book to the db
                db.books.push(newBook);

                // Write the updated database back to the 'db.json' file
                fs.writeFile("db.json", JSON.stringify(db, null, 2), (err)=> {
                    if (err) {
                        throw err; // If there's an error saving the file, throw it
                    }

                    // Respond with success message
                    res.writeHead(201, {"Content-Type": "application/json"});
                    res.write(JSON.stringify({message: "New book added successfully."}));
                    res.end();
                });

            } catch (err) {
                // Handle JSON parsing errors or other issues
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Invalid JSON data"}));
                res.end();
            }
            
        });
    }

    // Handle PUT request to update books availability
    else if(req.method === "PUT" && req.url.startsWith("/api/books/return")) {
        // Extract the bookId from the query string
        const parsedUrl = url.parse(req.url, true);
        const bookId = parsedUrl.query.id;

        // Validate that bookId is provided
        if (!bookId) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "Book ID is required." }));
            res.end();
            return;
        }

        let bookFound = false;
        let bookAlreadyAvailable = false;

        // Find the book and update its availability
        db.books.forEach((book) => {
            if (book.id === Number(bookId)) {

                bookFound = true;

                // Check if the book is already available
                if (book.is_available === 1) {
                    bookAlreadyAvailable = true;
                    return;
                }

                // Mark the book as available
                book.is_available = 1;
            }
        });

        // Handle case where the book was not found
        if (!bookFound) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "Book not found." }));
            res.end();
            return;
        }

        // Handle case where the book is already available
        if (bookAlreadyAvailable) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "Book is already available." }));
            res.end();
            return;
        }

        // Write updated book data to db.json
        fs.writeFile("db.json", JSON.stringify(db), (err) => {
            if (err) {
                throw err
            }

            // Respond with success message
            res.writeHead(200, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: "Book returned successfully."}));
            res.end();
        });

    }

    // Handle PUT request for editing a book
    else if (req.method === "PUT" && req.url.startsWith("/api/books")) {

        // Extract the bookId from the query string
        const parsedUrl = url.parse(req.url, true);
        const bookId = parsedUrl.query.id;

        // Collect incoming data
        let newBookDetails = "";
        req.on("data", (data) => {
            newBookDetails = newBookDetails + data.toString();
        });

        req.on("end", ()=> {

            try {

                // Parse and update the book details
                const reqBody = JSON.parse(newBookDetails);
    
                // Validate that title, author, and price are present
                if (!reqBody.title || !reqBody.author || reqBody.price === undefined) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.write(JSON.stringify({ message: "Missing title, author, or price." }));
                    res.end();
                    return;
                }
    
                // Validate that price is a number and non-negative
                if (typeof reqBody.price !== 'number' || reqBody.price < 0) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.write(JSON.stringify({ message: "Price must be a non-negative number." }));
                    res.end();
                    return;
                }
                
                let bookFound = false;
    
                db.books.forEach((book) => {
                    if (book.id === Number(bookId)) {
                        book.title = reqBody.title;
                        book.author = reqBody.author;
                        book.price = reqBody.price;
                        bookFound = true;
                    }
                });
    
    
                if (!bookFound) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.write(JSON.stringify({ message: "Book not found." }));
                    res.end();
                    return;
                }
    
                // Write updated book data to db.json
                fs.writeFile("db.json", JSON.stringify(db), (err) => {
                    if (err) {
                        throw err
                    }
    
                    // Respond with success message
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.write(JSON.stringify({message: "New book updated successfully."}));
                    res.end();
                });

            } catch (err) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Invalid JSON data."}));
                res.end();
            }

        });
    }

    // Handle POST request to login a user
    else if (req.method === "POST" && req.url.startsWith("/api/users/login")) {
    
        let user = "";

        // Receive incoming user data
        req.on("data", (data) => {
            // Convert incoming buffer data to a string and append it to the user variable
            user += data.toString();
        });
        
        // Once all data has been received (end of request)
        req.on("end", () => {

            // Parse the JSON string into a JavaScript object
            const {username, email} = JSON.parse(user)

            // Find the user in the database by matching the username and email
            const mainUser = db.users.find((user) => {
                return user.username === username && user.email === email;
            });

            // If no user is found, return a 401 Unauthorized response
            if(!mainUser) {
                res.writeHead(401, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "User not found."}));
                res.end();
                return;
            }

            // If the user is found, return a 200 OK response with the username and email
            res.writeHead(200, {"Content-Type": "application/json"});
            res.write(JSON.stringify({username: mainUser.username, email: mainUser.email }));
            res.end();
            return;      

        }); 
    }

    // Handle POST request for adding a user
    else if (req.method === "POST" && req.url.startsWith("/api/users")) {

        let user = ""

        // Receive incoming user data
        req.on("data", (data) => {
            user += data.toString();         
        });

        req.on("end", () => {

            try {
                // Parse the incoming JSON data
                const userData = JSON.parse(user);
                
                // Validate that 'name' and 'username' are present
                if (!userData.username || !userData.email) {
                    res.writeHead(400, {"Content-Type": "application/json"});
                    res.write(JSON.stringify({message: "Missing username or email."}));
                    res.end();
                    return; // Stop further execution if validation fails
                }

                const userExist = db.users.find((user)=>{
                    return user.email === userData.email || user.username === userData.username
                });

                if(userExist) {
                    res.writeHead(409, {"Content-Type": "application/json"});
                    res.write(JSON.stringify({message: "in adding user request , Username or email already exist."}));
                    res.end();
                    return; // Stop further execution if validation fails
                }

                // Create a new user object with default values for penalty and role
                const newUser = {
                    id: crypto.randomUUID(),
                    name: userData.name || "Anonymous",
                    username: userData.username,
                    email: userData.email,
                    ...JSON.parse(user),
                    "penalty": {"reason": "None","fine": 0},
                    "role": "USER"
                    };

                db.users.push(newUser); // Add the new user to the db

                // Write the updated database back to the 'db.json' file
                fs.writeFile("db.json", JSON.stringify(db, null, 2), (err)=> {
                    if (err) {
                        throw err; // If there's an error saving the file, throw it
                    }

                    // Respond with success message
                    res.writeHead(201, {"Content-Type": "application/json"});
                    res.write(JSON.stringify({message: "New user added successfully."}));
                    res.end();
                });

            } catch (err) {

                // Handle JSON parsing errors or other issues
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Invalid JSON data"}));
                res.end();
            }

        });
    }
    
    // Handle PUT request for updating role to ADMIN
    else if(req.method === "PUT" && req.url.startsWith("/api/users/upgrade")) {
        const parsedUrl = url.parse(req.url, true);
        const userId = parsedUrl.query.id;

        if(!userId) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "User ID is required." }));
            res.end();
            return;
        }

        let userFound = false;
        let roleUpdated = false;

        db.users.forEach((user) => {
            if(user.id === Number(userId)) {   
                userFound = true;
                
                if (user.role === "ADMIN") {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.write(JSON.stringify({ message: "User is already an ADMIN." }));
                    res.end();
                    return;
                }

                user.role = "ADMIN";
                roleUpdated = true;
            }
        });

        // If user is not found, return 404
        if (!userFound) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "User not found." }));
            res.end();
            return;
        }

        if(roleUpdated) {
            // Write the updated database back to 'db.json'
            fs.writeFile("db.json", JSON.stringify(db, null, 2), (err) => {
                if (err) {
                    throw err
                }
    
                res.writeHead(200, {"Content-Type": "application/json"});
                res.write(
                    JSON.stringify({message: "Role updated successfully."})
                );
                res.end();
    
            });
        }

    }

    // Handle PUT request for update penalty for a user
    else if(req.method === "PUT" && req.url.startsWith("/api/users")) {

        const parsedUrl = url.parse(req.url, true);
        const userId = parsedUrl.query.id;
        
        let reqBody = "";

        req.on("data", (data) => {
            reqBody += data.toString();
        });

        req.on("end", () => {

            try {

                // Parse the incoming JSON data (should contain the 'penalty' object)
                const penalty = JSON.parse(reqBody).penalty;

                console.log(penalty);

                // Ensure penalty data is present and valid
                if (!penalty || !penalty.reason || penalty.fine === undefined) {
                    res.writeHead(400, {"Content-Type": "application/json"});
                    res.write(JSON.stringify({message: "Missing or invalid penalty data."}));
                    res.end();
                    return;
                }
                
                let userFound = false;
    
                // Loop through users and update penalty for the correct user
                db.users.forEach((user) => {
                    if(user.id === Number(userId)) {
                        user.penalty = penalty;
                        userFound = true;
                    }
                });
    
                // Check if the user was found, if not, return 404
                if (!userFound) {
                    res.writeHead(404, {"Content-Type": "application/json"});
                    res.write(JSON.stringify({message: "User not found."}));
                    res.end();
                    return;
                }

                // Write the updated database back to 'db.json'
                fs.writeFile("db.json", JSON.stringify(db, null, 2), (err) => {
                    if (err) {
                        throw err
                    }
    
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.write(
                        JSON.stringify({message: "Penalty updated successfully."})
                    );
                    res.end();
    
                });
            } catch (err) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Invalid JSON data."}));
                res.end();
            }
        });
    }

   
});

// Start the server on port 4000
server.listen(4000, () => {
    console.log("Server is running on port 4000.");

});