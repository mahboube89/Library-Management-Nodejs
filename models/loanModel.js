"use strict";

const { db } = require("./../configs/db");
const { ObjectId } = require("mongodb");


// Function to add a new loan transaction to the userBookLoans array
const addBookLoan = async (newLoanTransaction) => {

    try {
        // Establish connection to the database
        const database = await db(); 
        const loansCollection = database.collection("loans"); 
        
        // Insert a new loan transaction into the loans collection
        const result = await loansCollection.insertOne(newLoanTransaction);
        return result;

    } catch (error) {
        throw new Error("Error adding loan transaction: " + error.message);
    }
    
};


// Function to find a loan by its associated bookId in the userBookLoans array
const foundLoanByBookId = async (bookId) => {
    
    try {
        
        // Establish connection to the database
        const database = await db(); 
        const loansCollection = database.collection("loans"); 
    
        // Find a loan transaction by the associated bookId
        const result = await loansCollection.findOne({ bookId: new ObjectId(bookId)});
        return result;

    } catch (error) {
        throw new Error("Error finding loan by bookId: " + error.message);
    }
};


// Function to remove a loan transaction by its loanId
const removeLoanById = async(loanId) => {

    try {
        
        // Establish connection to the database
        const database = await db(); 
        const loansCollection = database.collection("loans"); 
    
        // Delete a loan transaction by its unique _id
        const result = await loansCollection.deleteOne({ _id: new ObjectId(loanId)});
        return result;
        
    } catch (error) {
        throw new Error("Error removing loan by loanId: " + error.message);
    }
    
};


module.exports = {
    addBookLoan,
    foundLoanByBookId,
    removeLoanById
};