# Nodejs-Library-Management


## API Endpoints

## Users API

### Get All Users (GET)
- **Endpoint**: `/api/users`
- **Description**: Retrieves a list of all users in the system.
- **Requires**: No parameters or body required.
- **Response**: 
    - 200 OK: A JSON array of users
    - 500 Internal Server Error: If there is a server-side issue fetching users.


### Get a User by ID (GET)
- **Endpoint**: `/api/users?id={userId}`
- **Description**: Retrieves information about a specific user based on the provided userId.
- **Requires**: 
    - id (required) – The User ID.
- **Response**: 
    - 400 Bad Request: If userId is not provided.
    - 404 Not Found: If the user with the provided userId is not found.
    - 200 OK: Returns the user data.
    - 500 Internal Server Error: If there is a server-side issue fetching the user.


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
    - 201 Created: If the user is successfully added.
    - 400 Bad Request: If username or email is missing.
    - 409 Conflict: If username or email already exists.
    - 400 Bad Request: If the request body contains invalid JSON


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
    - 200 OK: Returns username and email.
    - 400 Bad Request: If username or email is missing.
    - 401 Unauthorized: If the user is not found.
    - 400 Bad Request: If the request body contains invalid JSON.


### Make Admin (PUT)
- **Endpoint**: `/api/users/upgrade?id={userId}`
- **Description**: Promotes a user to an ADMIN role.
- **Requires**: 
    - id (required) – The User ID.
- **Response**: 
    - 200 OK: If the role is successfully updated to admin.
    - 400 Bad Request: If userId is missing or if the user is already an admin.
    - 404 Not Found: If the user with the given userId is not found.


### Update User Penalty (PUT)
- **Endpoint**: `/api/users/penalty?id={userId}`
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
    - 200 OK: If the penalty is successfully updated.
    - 400 Bad Request: If the penalty object is missing or invalid (missing reason or fine).
    - 404 Not Found: If the user is not found.
    - 400 Bad Request: If the request body contains invalid JSON.


### Update User Infos (PUT)
- **Endpoint**: `/api/users?id={userId}`
- **Description**: Updates the penalty information for a user.
- **Requires**:
  - `id` (query parameter) – User ID
  - `reqBody` (JSON) – Contains a `penalty` object with `reason` and `fine`.
    {
        "name": "John Doe", (optional)
        "username": "johndoe",
        "email": "john.doe@example.com"
    }
- **Response**: 
    - 200 OK: If the user information is successfully updated.
    - 400 Bad Request: If the userId is missing or no update data is provided.
    - 404 Not Found: If the user is not found.
    - 400 Bad Request: If the request body contains invalid JSON.



## Books API

### Get All Books (GET)
- **Endpoint**: `/api/books`
- **Description**: Retrieves a list of all books in the system.
- **Requires**: No parameters or body required.
- **Response**: 
    - 200 OK: Returns a JSON array of books.
    - 500 Internal Server Error: If there is a server-side issue fetching the books. 


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
    - 201 Created: If the book is successfully added.
    - 400 Bad Request: If required fields (title, author, price) are missing or invalid.
    - 400 Bad Request: If the request body contains invalid JSON.


### Edit Book (PUT)
- **Endpoint**: `/api/books?id={bookId}`
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
    - 200 OK: If the book details are successfully updated.
    - 400 Bad Request: If bookId is missing or invalid, or if price is negative.
    - 404 Not Found: If the book with the provided bookId is not found.
    - 400 Bad Request: If the request body contains invalid JSON.

### Delete Book (DELETE)
- **Endpoint**: `/api/books?id={bookId}`
- **Description**:  Deletes a book from the library.
- **Requires**: 
    - id (required) – The Book ID.
- **Response**: 
    - 200 OK: If the book is successfully deleted.
    - 404 Not Found: If the book is not found.



## Loans API

### Loan a Book (POST)
- **Endpoint**: `/api/books/loan`
- **Description**: Loans a book to a user.
- **Requires**: 
    - Request Body:
    {
        "userId": "6713957c4cf7dbf300189f71",
        "bookId": "6712dba8cf3c6211e6f058a8",
        "returnDate": "2024-11-01" (optional)
    }
- **Response**: 
    - 201 Created: If the book is successfully loaned.
    - 400 Bad Request: If userId or bookId is missing or invalid, or if the book is already loaned out.
    - 404 Not Found: If the user or book is not found.
    - 400 Bad Request: If the request body contains invalid JSON.


### Return a Book (PUT)
- **Endpoint**: `/api/books/return?id={bookId}`
- **Description**: Marks a book as returned and updates its availability.
- **Requires**:
    - id (required) – The Book ID.
- **Response**: 
    - 200 OK: If the book is successfully returned.
    - 400 Bad Request: If bookId is missing or if the book is already available.
    - 404 Not Found: If the book is not found.
