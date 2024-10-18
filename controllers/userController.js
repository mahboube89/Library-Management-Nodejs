"use strict";

const url = require("url");
const crypto = require("crypto");
const userModel = require("../models/userModel");


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
            const userData = JSON.parse(user);
            
            // Validate that 'name' and 'username' are present
            if (!userData.username || !userData.email) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Missing username or email."}));
                res.end();
                return; // Stop further execution if validation fails
            }

            // Check if user already exists by username or email
            const userExist = await userModel.userAlreadyExist(userData.username, userData.email);            

            if(userExist) {
                res.writeHead(409, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Username or email already exist."}));
                res.end();
                return; // Stop further execution if validation fails
            }

            // Create a new user object with default values for penalty and role
            const newUser = {
                ...userData,
                name: userData.name || "Anonymous",
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
            res.write(JSON.stringify({message: "Invalid JSON data"}));
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
            const mainUser = await userModel.findUserByUsernameEmail(username, email);

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

    const parsedUrl = url.parse(req.url, true);
    const userId = parsedUrl.query.id;
    
    if(!userId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: "User ID is required." }));
        res.end();
        return;
    }

    try {
        const userFound = await userModel.findUserById(userId);   

        // If user is not found, return 404
        if (!userFound) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "User not found." }));
            res.end();
            return;
        }

        const isRoleAdmin = await userModel.isAdmin(userId);    

        if (isRoleAdmin) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "User is already an ADMIN." }));
            res.end();
            return;
        }

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

    const parsedUrl = url.parse(req.url, true);
    const userId = parsedUrl.query.id;
    
    let reqBody = "";

    req.on("data", (data) => {
        reqBody += data.toString();
    });

    req.on("end", async() => {

        try {

            // Parse the incoming JSON data (should contain the 'penalty' object)
            const penalty = JSON.parse(reqBody).penalty;

            // Ensure penalty data is present and valid
            if (!penalty || !penalty.reason || penalty.fine === undefined) {
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


module.exports = {
    getAllUsers,
    addUser,
    loginUser,
    makeAdmin,
    updatePenalty
};