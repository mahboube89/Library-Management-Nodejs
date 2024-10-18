"use strict";
require("dotenv").config(); 


// Importing the MongoClient from the MongoDB package
const { MongoClient } = require("mongodb");


// Setting up the connection URL for the MongoDB instance
const url = "mongodb://localhost:27017/";

// Creating a new MongoClient instance to manage the connection
const dbConnection = new MongoClient(process.env.URL);

// Name of the database to use in MongoDB
const dbName = process.env.DB_NAME;


// Main async function to establish the connection and interact with the database
const main = async () => {

    // Connect to MongoDB
    await dbConnection.connect();
    console.log("connect to mongodb successfully");

    // Get a reference to the database
    const db = dbConnection.db(dbName);

    return "Done";
    
};


// Calling the main function to establish the connection
main();