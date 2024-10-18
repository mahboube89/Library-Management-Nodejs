
const bookModel = require("../models/bookModel");
const loanModel = require("../models/loanModel");
const userModel = require("../models/userModel");
const url = require("url");
const { ObjectId } = require("mongodb");


const loanBook = async (req, res) => {

    let reqBody = "";

    // Receive incoming data
    req.on("data", (data) => {
        reqBody += data.toString();
    });

    req.on("end", async() => {

        try {

            // Parse the request body to extract userId and bookId
            const parsedBody = JSON.parse(reqBody);
            let { userId, bookId, returnDate } = parsedBody;

            // Ensure userId and bookId are trimmed (removing any potential spaces)
            userId = userId.trim();
            bookId = bookId.trim();

            // Validate that userId and bookId are present
            if (!userId || !bookId) {
                throw new Error("Missing userId or bookId in request body");
            }

            // Validate that userId and bookId are valid ObjectIds
            if (!ObjectId.isValid(userId) || !ObjectId.isValid(bookId)) {
                throw new Error("Invalid userId or bookId format");
            }

            // Convert userId and bookId to ObjectId
            userId = new ObjectId(userId);
            bookId = new ObjectId(bookId);


            // Check if the user exists in the database
            const user = await userModel.findUserById(userId);
            if (!user) {
                // If the user is not found, return a 404 Not Found error
                res.writeHead(404, { "Content-Type": "application/json" });
                res.write(JSON.stringify({ message: "User not found." }));
                res.end();
                return;
            }

            // Check if the book exists in the database
            const book = await bookModel.findBookById(bookId);

            if (!book) {
                // If the book is not found, return a 404 Not Found error
                res.writeHead(404, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Book not found."}));
                res.end();
                return;
            }
            
            // Check if the book is available (is_available === 1)
            if (book.is_available !== 1) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message: "Book is not available."}));
                res.end();
                return;
            }

            // Mark the book as unavailable
            const makeUnavailable = await bookModel.updateBookAvailability(bookId, 0);

            if (makeUnavailable.modifiedCount === 0) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.write(JSON.stringify({ message: "Failed to update book availability." }));
                res.end();
                return;
            }

            
            // Set the loan date to today
            const loanDate = new Date();

            // If returnDate is provided ("2024-11-01" format), use it; otherwise, set a default return date (14 days from the loan date)
            returnDate = returnDate ? new Date(returnDate) : new Date(loanDate.getTime() + 14 * 24 * 60 * 60 * 1000);

            // Create a new loan transaction for the user and book
            const userBookTransaction = {
                userId,
                bookId,           
                loanDate: loanDate.toISOString(),
                returnDate: returnDate
            };
            
            // Add the new loan transaction to the userBookLoans array
            await loanModel.addBookLoan(userBookTransaction);

            res.writeHead(201, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: "Book loaned successfully."}));
            res.end();
                
        } catch (err) {
            console.log("Error during loanBook process:", err.message);
            res.writeHead(400, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: "Invalid JSON data."}));
            res.end();
        }
    });
};


const returnBook = async (req, res) => {

    try {

        // Extract the bookId from the query string
        const parsedUrl = url.parse(req.url, true);
        let bookId = parsedUrl.query.id;
    
        bookId = bookId.trim();
    
        // Validate that bookId is provided
        if (!bookId) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "Book ID is required." }));
            res.end();
            return;
        }
    
        // Validate that userId and bookId are valid ObjectIds
        if (!ObjectId.isValid(bookId)) {
            throw new Error("Invalid bookId format");
        }
    
        // Convert bookId to ObjectId
        bookId = new ObjectId(bookId);

        // Find the book by bookId
        const book = bookModel.findBookById(bookId);

        if (!book) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "Book not found." }));
            res.end();
            return;
        }
        
        // Mark the book as available (returning the book)
        await bookModel.updateBookAvailability(bookId, 1);

        const loan = await loanModel.foundLoanByBookId(bookId);

        if (loan) {
            // Remove the loan transaction
            await loanModel.removeLoanById(loan.id);
        }

        // Respond with success message
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify({message: "Book returned successfully."}));
        res.end();


    } catch (error) {       
        res.writeHead(500, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: error.message }));
        res.end();      
    }
};


module.exports = {
    loanBook,
    returnBook,
};