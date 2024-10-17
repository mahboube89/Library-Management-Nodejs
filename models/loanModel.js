const db = require("../db.json");
const fs = require("fs");
const path = require("path");
const dbPath = path.join(__dirname, "../db.json");


// Function to read the database (db.json) 
const readDb = () => {
    return new Promise((resolve, reject) => {
        // Read the db.json file and handle any potential errors
        fs.readFile(dbPath, "utf-8", (err, data)=> {
            if (err) reject(err);
            resolve(JSON.parse(data));
        });
    });
};


// Function to write data to the database (db.json)
const writeDb = (data) => {
    return new Promise((resolve, reject) => {
        // Write the data to db.json and format it with indentation (null, 2)
        fs.writeFile(dbPath, JSON.stringify(data, null, 2), (err) => {       
            if (err) reject(err);
            resolve(); // Resolve the promise once the data has been successfully written
        });
    });
};


// Function to add a new loan transaction to the userBookLoans array
const addBookLoan = async (newLoanTransaction) => {
    const db = await readDb();

    // Add the new loan transaction to the userBookLoans array
    db.userBookLoans.push(newLoanTransaction);

    // Write the updated database state back to db.json
    await writeDb(db);   
};

// Function to find a loan by its associated bookId in the userBookLoans array
const foundLoanByBookId = async (bookId) => {
    const db = await readDb();

    // Find and return the loan transaction with the matching bookId
    return db.userBookLoans.find((book) => book.id === bookId);
};


// Function to remove a loan transaction by its loanId
const removeLoanById = async(loanId) => {
    const db = await readDb();

    // Filter out the loan transaction with the matching loanId
    const newLoans = db.userBookLoans.filter((loan) => loan.id !== loanId);

    // Write the updated loan transactions back to db.json
    await writeDb({...db, userBookLoans: newLoans});
};

module.exports = {
    addBookLoan,
    foundLoanByBookId,
    removeLoanById
};