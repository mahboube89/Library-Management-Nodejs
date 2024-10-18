"use strict";

const fs = require("fs");
const path = require("path");
const dbPath = path.join(__dirname, "../db.json");


// Function to read the database (db.json) file
const readDb = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(dbPath, "utf-8", (err, data) => {
            if (err) reject(err);

            resolve(JSON.parse(data));
        });
    });
};


// Function to write to the database (db.json) file
const writeDb = (data) => {
    return new Promise((resolve, reject) => {
       fs.writeFile(dbPath, JSON.stringify(data, null, 2), (err) => {
            if (err) reject(err);
            resolve();
       }); 
    });
};


// Get all users from the database
const getAllUsers = async () => {
    const db = await readDb();
    return db.users; // Return the list of users
};


// Check if a user already exists by username or email
const userAlreadyExist = async (username, email) => {
    const db = await readDb();

    // Find a user with a matching username or email
    return db.users.find((user)=> {
        return user.email === email || user.username === username
    });
};


// Add a new user to the database
const addUser = async (newUser) => {
    const db = await readDb();
    db.users.push(newUser); // Add the new user to the db
    await writeDb(db); // Write the updated database back to db.json
};


// Find a user by both username and email
const findUserByUsernameEmail = async (username, email) => {
    const db = await readDb();

    // Find and return the user with matching username and email
    return db.users.find((user) => {
        return user.username === username && user.email === email;
    });
};


// Find a user by their user ID
const findUserById = async(userId) => {
    const db = await readDb();

    // Find and return the user with the matching user ID
    return db.users.find((user) => {
        return user.id === userId;
    });
};


// Check if a user is an admin by their user ID
const isAdmin = async (userId) => {
    const db = await readDb();

     // Find the user by their user ID
    const user = db.users.find((user) => user.id === userId);

    if(user) {
        // Return true if the user's role is "ADMIN", otherwise false
        return user.role === "ADMIN";
    } else {
        // Throw an error if the user is not found
        throw new Error("User not found");
    }
};


// Promote a user to admin by their user ID
const makeAdmin = async(userId) => {
    const db = await readDb();

    // Find the user by their user ID
    const user = db.users.find((user) => user.id === userId);

    if(user) {
        user.role = "ADMIN"; // Update the user's role to "ADMIN"

        // Write the updated database back to the db.json file
        await writeDb(db);
        return user; // Return the updated user
    } else {
        throw new Error("User not found.")
    }
};


// Update a user's penalty by their user ID
const updatePenalty = async(userId, penalty) => {
    const db = await readDb();

    // Find the user by their user ID
    const user = db.users.find((user) => user.id === userId);

    if(user) {
        // Update the user's penalty
        user.penalty = penalty;

        // Write the updated database back to the db.json file
        await writeDb(db);
        return user; // Return the updated user
    } else {
        throw new Error("User not found.")
    }
};


module.exports = {
    getAllUsers,
    userAlreadyExist,
    addUser,
    findUserByUsernameEmail,
    findUserById,
    isAdmin,
    makeAdmin,
    updatePenalty
};