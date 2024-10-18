"use strict";

const { db } = require("./../configs/db");
const { ObjectId } = require("mongodb");


// Get all users from the database
const getAllUsers = async () => {

    // Establish connection to the database
    const database = await db();
    const usersCollection = database.collection("users"); // Access the "users" collection

    // Fetch all users
    return await usersCollection.find({}).toArray();   
};


// Check if a user already exists by username or email
const userAlreadyExist = async (username, email) => {
    
    // Establish connection to the database
    const database = await db();
    const usersCollection = database.collection("users"); // Access the "users" collection

    // Find a user with matching username or email
    return await usersCollection.findOne({
        $or: [{ usename: username }, { email: email }],
    });
};


// Add a new user to the database
const addUser = async (userData) => {

    // Establish connection to the database
    const database = await db();
    const usersCollection = database.collection("users"); // Access the "users" collection

    // Set the timestamps
    const timestamp = new Date();

    const newUser = {
        ...userData,
        created_at: timestamp, // Set the current time as the creation time
        updated_at: timestamp, // Initially, updated_at is the same as created_at
    };

    // Insert the  user into the MongoDB collection
    return await usersCollection.insertOne(newUser);   
};


// Find a user by both username and email
const findUserByUsernameEmail = async (username, email) => {

    // Establish connection to the database
    const database = await db();
    const usersCollection = database.collection("users"); // Access the "users" collection

    // Find the user by username and email
    return await usersCollection.findOne({
        username: username,
        email: email,
    });
};


// Find a user by their user ID
const findUserById = async(userId) => {

    // Establish connection to the database
    const database = await db();
    const usersCollection = database.collection("users"); // Access the "users" collection

    const objectId = new ObjectId(userId);

    return await usersCollection.findOne({ _id: objectId});
    
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

    // Establish connection to the database
    const database = await db();
    const usersCollection = database.collection("users"); // Access the "users" collection

    const objectId = new ObjectId(userId);

    const result = usersCollection.updateOne(
        { _id: objectId},
        { $set: { role: "ADMIN"}}
    );

    return result;
};


// Update a user's penalty by their user ID
const updatePenalty = async(userId, penalty) => {

    // Establish connection to the database
    const database = await db();
    const usersCollection = database.collection("users"); // Access the "users" collection

    const objectId = new ObjectId(userId);

    const result = usersCollection.updateOne(
        { _id: objectId},
        { $set: { penalty: penalty , updated_at: new Date() }}
    );

    return result;
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