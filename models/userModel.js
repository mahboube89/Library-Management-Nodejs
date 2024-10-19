"use strict";

const { db } = require("./../configs/db");
const { ObjectId } = require("mongodb");


// Get all users from the database
const getAllUsers = async () => {

    try {
        
        // Establish connection to the database
        const database = await db();
        const usersCollection = database.collection("users"); // Access the "users" collection
    
        // Fetch all users
        return await usersCollection.find({}).toArray();

    } catch (error) {
        throw new Error ("Error fetching all users.");
    }
};


// Check if a user already exists by username or email
const userAlreadyExist = async (userId, username, email) => {
    
    try {
        
        // Establish connection to the database
        const database = await db();
        const usersCollection = database.collection("users"); // Access the "users" collection
    
        // Convert the userId to ObjectId
        const objectId = new ObjectId(userId);
    
        // Find a user with matching username or email
        return await usersCollection.findOne(
            {
            $or: [{ username: username }, { email: email }],
            _id: { $ne: objectId }
            }
        );

    } catch (error) {
        throw new Error ("Error checking user existence.");
    }
};


// Add a new user to the database
const addUser = async (userData) => {
    
    try {
        
        // Establish connection to the database
        const database = await db();
        const usersCollection = database.collection("users"); // Access the "users" collection
    
        if (userData.username || userData.email) {
    
            // Check if the username or email already exists in another user
            const existingUser = await findUserByUsernameEmail(userData.username, userData.email);
    
            if (existingUser) {
                throw new Error('Username or email already exists for another user.');
            }
        }
    
    
        // Set the timestamps
        const timestamp = new Date();
    
        const newUser = {
            ...userData,
            created_at: timestamp, // Set the current time as the creation time
            updated_at: timestamp, // Initially, updated_at is the same as created_at
        };
    
        // Insert the  user into the MongoDB collection
        return await usersCollection.insertOne(newUser); 

    } catch (error) {
        throw new Error ("Error adding a new user.");
    }
};


// Find a user by both username and email
const findUserByUsernameEmail = async (username, email) => {

    try {
        
        // Establish connection to the database
        const database = await db();
        const usersCollection = database.collection("users"); // Access the "users" collection
    
        // Find the user by username and email
        return await usersCollection.findOne(
            {
                $or: [ {username: username}, {email: email} ]
            }
        );
        
    } catch (error) {
        throw new Error ("Error finding user by username and email.");
    }
};


// Find a user by their user ID
const findUserById = async(userId) => {

    try {
        // Establish connection to the database
        const database = await db();
        const usersCollection = database.collection("users"); // Access the "users" collection
    
        const objectId = new ObjectId(userId);
    
        return await usersCollection.findOne({ _id: objectId});
        
    } catch (error) {
        throw new Error ("Error finding user by ID.");
    }  
};


// Check if a user is an admin by their user ID
const isAdmin = async (userId) => {

    const user = await findUserById(userId);

    // Check if the user has the role "ADMIN"
    if (user) {
        return user.role === "ADMIN";
    } else {
        throw new Error("User not found.")
    }
};


// Promote a user to admin by their user ID
const makeAdmin = async(userId) => {

    try {
        
        // Establish connection to the database
        const database = await db();
        const usersCollection = database.collection("users"); // Access the "users" collection
    
        const userExist = await findUserById(userId);
        if (!userExist) {
            throw new Error('User not found.');
        }
    
        const isAdminAlready = await isAdmin(userId);
    
        if(isAdminAlready) {
            throw new Error('User is already an ADMIN.');
        }
    
        const objectId = new ObjectId(userId);
    
        const result = usersCollection.updateOne(
            { _id: objectId},
            { $set: { role: "ADMIN"}}
        );
    
        // Ensure the operation was successful
        if (result.matchedCount === 0) {
            throw new Error("No changes detected.");
        }
    
        return result;

    } catch (error) {
        throw new Error('Error promoting user to ADMIN.');
    }
};


// Update a user's penalty by their user ID
const updatePenalty = async(userId, penalty) => {

    try {
        
        // Establish connection to the database
        const database = await db();
        const usersCollection = database.collection("users"); // Access the "users" collection
    
        const objectId = new ObjectId(userId);
    
        const result = usersCollection.updateOne(
            { _id: objectId},
            { $set: { penalty: penalty , updated_at: new Date() }}
        );
    
        // Ensure the operation was successful
        if (result.matchedCount === 0) {
            throw new Error("No changes detected.");
        }
    
        return result;
        
    } catch (error) {
        throw new Error('Error updating user penalty.');
    }
};


// Update a user's details
const updateUserInfo = async(userId, userData) => {

    try {

        // Establish connection to the database
        const database = await db();
        const usersCollection = database.collection("users"); // Access the "users" collection    
    
        // Check if the userData contains username or email
        if (userData.username || userData.email) {
    
            // Check if the username or email already exists in another user
            const existingUser = await userAlreadyExist(userId, userData.username, userData.email);
    
            if (existingUser) {
                throw new Error('Username or email already exists for another user.');
            }
        }
    
        // Convert the userId to ObjectId
        const objectId = new ObjectId(userId);
    
        // Capture the current timestamp for the 'updated_at' field
        const timestamp = new Date();
    
        // Build the update data dynamically based on the fields provided
        const updateFields = { updated_at: timestamp };
    
        // Check if the userData contains a username, if so, add it to the updateFields object
        if (userData.username) {
            updateFields.username = userData.username;
        }
    
        // Check if the userData contains an email, if so, add it to the updateFields object
        if (userData.email) {
            updateFields.email = userData.email;
        }
    
        // Check if the userData contains a name, if so, add it to the updateFields object
        if (userData.name) {
            updateFields.name = userData.name;
        }
    
        // Update only the provided fields
        const result = await usersCollection.updateOne(
            { _id: objectId },
            { $set: updateFields }
        );
    
        // Ensure the operation was successful
        if (result.matchedCount === 0) {
            throw new Error("No changes detected.");
        }
        
        return result;
        
    } catch (error) {
        throw new Error('Error updating user info.');
    }
    
};

const loginUser = async (username, email) => {

    try {

        // Establish connection to the database
        const database = await db();
        const usersCollection = database.collection("users"); // Access the "users" collection
    
        // Find the user by username and email
        return await usersCollection.findOne(
            
            {
                $and: [{ username: username }, { email: email }]
            }
           
        );
        
    } catch (error) {
        throw new Error('Error during login.');
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
    updatePenalty,
    updateUserInfo,
    loginUser
};