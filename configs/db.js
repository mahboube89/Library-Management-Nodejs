"use strict";
require("dotenv").config(); 


// Importing the MongoClient from the MongoDB package
const { MongoClient } = require("mongodb");


// Creating a new MongoClient instance to manage the connection
const dbConnection = new MongoClient(process.env.URL);

// Name of the database to use in MongoDB
const dbName = process.env.DB_NAME;


// Export async function to establish the connection and interact with the database
module.exports = {
    db: async () => {

        // Connect to MongoDB
        await dbConnection.connect();
        console.log("connect to mongodb successfully");
    
        // Get a reference to the database
        const db = dbConnection.db(dbName);    
        return db;
    }
};
