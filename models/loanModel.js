"use strict";

const { db } = require("./../configs/db");
const { ObjectId } = require("mongodb");


// Function to add a new loan transaction to the userBookLoans array
const addBookLoan = async (newLoanTransaction) => {

    // Establish connection to the database
    const database = await db(); 
    const loansCollection = database.collection("loans"); 
    
    // Insert a new loan transaction into the loans collection
    const result = await loansCollection.insertOne(newLoanTransaction);
    return result;
};


// Function to find a loan by its associated bookId in the userBookLoans array
const foundLoanByBookId = async (bookId) => {
    
    // Establish connection to the database
    const database = await db(); 
    const loansCollection = database.collection("loans"); 

    // Find a loan transaction by the associated bookId
    const result = await loansCollection.findOne({ bookId: new ObjectId(bookId)});
    return result;
};


// Function to remove a loan transaction by its loanId
const removeLoanById = async(loanId) => {

    // Establish connection to the database
    const database = await db(); 
    const loansCollection = database.collection("loans"); 

    // Delete a loan transaction by its unique _id
    const result = await loansCollection.deleteOne({ _id: new ObjectId(loanId)});
    return result;
    
};


module.exports = {
    addBookLoan,
    foundLoanByBookId,
    removeLoanById
};