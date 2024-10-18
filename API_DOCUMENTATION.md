# Nodejs-Library-Management


## API Endpoints

## Users API

### Get All Users (GET)
- **Endpoint**: `/api/users`
- **Description**: Retrieves a list of all users in the system.
- **Requires**: No parameters or body required.
- **Response**: 
    - 200 OK: A JSON array of users
    - 500 : Failed to fetch users.


### Add User (POST)
- **Endpoint**: `/api/users`
- **Description**: Adds a new user to the system.
- **Requires**: 
    - Request Body:
    {
        "name": "John Doe", (optional)
        "username": "johndoe",
        "email": "john.doe@example.com"
    }
- **Response**: 
    - 201 Created: A success message
    - 400 Bad Request: If username or email is missing.
    - 409 Conflict: If username or email already exists.
    - 400 Invalid JSON: If the request body is not valid JSON


### Login User (POST)
- **Endpoint**: `/api/users/login`
- **Description**: Logs a user in by verifying their username and email.
- **Requires**: 
    - Request Body:
    {
        "username": "johndoe",
        "email": "john.doe@example.com"
    }
- **Response**: 
    - 200 OK: Returns the username and email
    - 400 Bad Request: If username or email is missing.
    - 401 Unauthorized: If the user is not found.
    - 400 Invalid JSON: If the request body is not valid JSON


### Make Admin (PUT)
- **Endpoint**: `/api/users/upgrade`
- **Description**: Promotes a user to an ADMIN role.
- **Requires**: 
    - id (required) – The User ID.
- **Response**: 
    - 200 OK: Success message if the role was updated.
    - 400 Bad Request: If id is missing or if the user is already an admin.
    - 404 Not Found: If the user is not found.


### Update User Penalty (PUT)
- **Endpoint**: `/api/users`
- **Description**: Updates the penalty information for a user.
- **Requires**:
  - `id` (query parameter) – User ID
  - `reqBody` (JSON) – Contains a `penalty` object with `reason` and `fine`.
    {
        "penalty": {
            "reason": "Late return",
            "fine": 50
        }
    }
- **Response**: 
    - 200 OK: If the penalty was updated.
    - 400 Bad Request: If the penalty object is missing or invalid.
    - 404 Not Found: If the user is not found.
    - 400 Invalid JSON: If the request body is not valid JSON


## Books API

### Get All Books (GET)
- **Endpoint**: `/api/books`
- **Description**: Retrieves a list of all books in the system.
- **Requires**: No parameters or body required.
- **Response**: 
    - 200 OK: A JSON array of users


### Add Book (POST)
- **Endpoint**: `/api/books`
- **Description**: Adds a new book to the library.
- **Requires**: 
    - Request Body:
    {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "price": 25
    }
- **Response**: 
    - 201 Created: A success message
    - 400 Bad Request: If title, author, or price is missing or invalid.
    - 400 Invalid JSON: If the request body is not valid JSON


### Edit Book (PUT)
- **Endpoint**: `/api/books`
- **Description**: Updates the details of an existing book (can update title, author, or price). Fields not provided in the request body will remain unchanged.
- **Requires**: 
    - id (required) – The Book ID.
    - Request Body:
    {
        "title": "The Great Gatsby", (optional)
        "author": "F. Scott Fitzgerald", (optional)
        "price": 25 (optional)
    }
- **Response**: 
    - 200 OK: If the book was successfully updated
    - 400 Bad Request: If the price is negative or non-numeric, or if the id is not provided.
    - 404 Not Found: If the book with the specified id is not found
    - 400 Invalid JSON: If the request body is not valid JSON


### Delete Book (DELETE)
- **Endpoint**: `/api/books`
- **Description**:  Deletes a book from the library.
- **Requires**: 
    - id (required) – The Book ID.
- **Response**: 
    - 200 OK: Success message.
    - 404 Not Found: If the book is not found.


## Loans API

### Loan a Book (POST)
- **Endpoint**: `/api/books/loan`
- **Description**: Loans a book to a user.
- **Requires**: 
    - Request Body:
    {
        "userId": "a37e7ce5-cb15-4220-ae59-51cbba7008af",
        "bookId": "1",
        "returnDate": "2024-11-01" (optional)
    }
- **Response**: 
    - 201 Created: Success message.
    - 400 Bad Request: If the book is already loaned out or if the request data is invalid.
    - 404 Not Found: If the book or user is not found.
    - 400 Invalid JSON: If the request body is not valid JSON


### Return a Book (PUT)
- **Endpoint**: `/api/books/return`
- **Description**: Marks a book as returned and updates its availability.
- **Requires**:
    - id (required) – The Book ID.
- **Response**: 
    - 200 OK: Success message.
    - 400 Bad Request: If the book is already available.
    - 404 Not Found: If the book is not found.
