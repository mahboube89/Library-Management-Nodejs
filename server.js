const http = require("http");
const fs = require("fs");
const url = require("url");
const crypto = require("crypto");

const db = require("./db.json");
const bookController = require("./controllers/bookController");
const loanController = require("./controllers/loanController");


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