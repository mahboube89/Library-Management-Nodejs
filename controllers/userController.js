"use strict";

const url = require("url");
const userModel = require("../models/userModel");


// Utility function to parse and validate userId
const parseUserId = (req, res) => {

    // Extract the userId from the query string
    const parsedUrl = url.parse(req.url, true);
    const userId = parsedUrl.query.id;
    
    if(!userId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: "User ID is required." }));
        res.end();
        return null;
    }

    return userId;
};



// Controller function to handle the GET request for fetching all users
const getAllUsers = async (req, res) => {

    try {
        // Fetch all users from the userModel
        const users = await userModel.getAllUsers();

        // Set response headers
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(users)); // Send users data as a response
        res.end(); // End the response

    } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: "Failed to fetch users." }));
        res.end();
    }    
};


// Controller function to handle the POST request for adding a user
const addUser = async (req, res) => {

    let user = "";

    // Receive incoming user data
    req.on("data", (data) => {
        user += data.toString();         
    });

    req.on("end", async () => {

        try {
            // Parse the incoming JSON data
            const {name = "Anonymous", username, email} = JSON.parse(user);
            
            // Validate that 'name' and 'username' are present
            if (!username || !email) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Missing username or email."}));
                res.end();
                return; // Stop further execution if validation fails
            }

            // Create a new user object with default values for penalty and role
            const newUser = {
                name, // The name with default value if not provided
                username,
                email,
                "role": "USER",
                "penalty": {"reason": "None","fine": 0},
            };

            // Add the new user to the database
            await userModel.addUser(newUser);

            // Respond with success message
            res.writeHead(201, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: "New user added successfully."}));
            res.end();

        } catch (err) {

            // Handle JSON parsing errors or other issues
            res.writeHead(400, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: err.message}));
            res.end();
        };

    });
};


// Controller function to handle the POST request to login a user
const loginUser = async (req, res) => {
    let user = "";

        // Receive incoming user data
        req.on("data", (data) => {
            // Convert incoming buffer data to a string and append it to the user variable
            user += data.toString();
        });
        
        // Once all data has been received (end of request)
        req.on("end", async () => {

            // Parse the JSON string into a JavaScript object
            const {username, email} = JSON.parse(user);

            if(!username || !email) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Missing username or email."}));
                res.end();
                return; // Stop further execution if validation fails
            }

            // Find the user in the database by matching the username and email
            const mainUser = await userModel.loginUser(username, email);

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
};


// Controller function to handle the PUT request for updating role to ADMIN
const makeAdmin = async (req, res) => {

    const userId = parseUserId(req, res);
    if(!userId) return;

    try {

        await userModel.makeAdmin(userId);
       
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(
            JSON.stringify({message: "Role updated successfully."})
        );
        res.end();
        
    } catch (error) {
        // Handle any errors thrown by isAdmin or other functions
        res.writeHead(500, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: error.message }));
        res.end();       
    }     
};


// Controller function to handle the PUT request for update penalty for a user
const updatePenalty = async(req, res) => {

    const userId = parseUserId(req, res);
    if(!userId) return;
    
    let reqBody = "";

    req.on("data", (data) => {
        reqBody += data.toString();
    });

    req.on("end", async() => {

        try {

            // Parse the incoming JSON data (should contain the 'penalty' object)
            const {reason , fine} = JSON.parse(reqBody).penalty;

            // Ensure penalty data is present and valid
            if (!reason || fine === undefined) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Missing or invalid penalty data."}));
                res.end();
                return;
            }
                      
            const userFound = await userModel.findUserById(userId);

            // Check if the user was found, if not, return 404
            if (!userFound) {
                res.writeHead(404, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "User not found."}));
                res.end();
                return;
            }
            
            const updatedPenalty = await userModel.updatePenalty(userId, penalty);

            if (updatedPenalty) {

                res.writeHead(200, {"Content-Type": "application/json"});
                res.write(
                    JSON.stringify({message: "Penalty updated successfully."})
                );
                res.end();
            }

        } catch (err) {
            res.writeHead(400, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: "Invalid JSON data."}));
            res.end();
        }
    });
};


// Controller function to handle the PUT request for update penalty for a user
const updateUserInfo = async(req, res) => {

    const userId = parseUserId(req, res);
    if(!userId) return;

    // Collect incomming data
    let newUserDatails = "";

    req.on("data", (data) => {
        newUserDatails += data.toString();
    });

    req.on("end", async() => {

        try {
            
            // Parse and update the user details
            const userData = JSON.parse(newUserDatails);            

            // Ensure at least one field is provided to update
            if (!userData || Object.keys(userData).length === 0) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.write(JSON.stringify({ message: "No user data provided for update." }));
                res.end();
                return;
            }

            // Call the updateUserInfo function from the model and wait for it to complete
            const updatedUser = await userModel.updateUserInfo(userId, userData);
            
            if (updatedUser.matchedCount === 0) {
                res.writeHead(404, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "User not found."}));
                res.end();
                return;
            }

            // Respond with success message
            res.writeHead(200, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: "User updated successfully."}));
            res.end();

        } catch (error) {

            res.writeHead(400, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: error.message}));
            res.end();
        }
    });
};


const getUserById = async(req, res) => {

    const userId = parseUserId(req, res);
    if(!userId) return;

    try {
        // Fetch user by userId from the userModel
        const user = await userModel.findUserById(userId);

        if (!user) {
            // If the user is not found, return 404
            res.writeHead(404, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "User not found." }));
            res.end();
            return;
        }

        // Set response headers
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(user)); // Send users data as a response
        res.end(); // End the response

    } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: "Failed to fetch users." }));
        res.write(JSON.stringify({ message: err.message}));
        res.end();
    }    
};


module.exports = {
    getAllUsers,
    addUser,
    loginUser,
    makeAdmin,
    updatePenalty,
    updateUserInfo,
    getUserById
};