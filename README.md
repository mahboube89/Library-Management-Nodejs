# Nodejs-Library-Management

Nodejs-Library-Management is a basic Library Management System built using Node.js and MongoDB. The system allows for the management of books, users, and loan transactions. This project implements a simple API for adding, updating, and deleting users and books, along with tracking loaned books to users.


## Overview
This project is designed to provide a basic implementation of a library management system. It allows users to perform the following tasks:

- Add, view, update, and delete books.
- Add, view, update users, and assign users the "Admin" role.
- Manage book loans and returns.
- Penalty system for users with overdue books.


## Dependencies
The project uses the following dependencies:
```json
"dependencies": {
    "dotenv": "^16.4.5",
    "mongodb": "^6.9.0",
    "nodemon": "^3.1.7"
}
```
- dotenv: Loads environment variables from a .env file.
- mongodb: Official MongoDB driver for Node.js.
- nodemon: Monitors changes in the project and automatically restarts the server (used in development).


## Setup Instructions
To get the project running locally, follow these steps:

### Prerequisites
- Node.js installed on your machine.
- MongoDB installed and running (or use MongoDB Atlas for a cloud database).

### Steps
1- Clone the repository:

```
git clone https://github.com/mahboube89/Nodejs-Library-Management.git
cd Nodejs-Library-Management
```

2- Install dependencies:
        ```
        npm install
       ```

3- Set up environment variables:

- Copy the `.env.example` file to `.env`  
        ```
        cp .env.example .env
        ```        
 Adjust the URI if you're using a cloud database like MongoDB Atlas.

4- Update your .env file with the necessary environment variables:
    ```
    PORT=4000
    URL = "mongodb://localhost:27017/"
    DB_NAME = "library"
    ```
Adjust the `URI` if you're using a cloud database like MongoDB Atlas.

5- Run the server:
    ```
    npm run start
    ```
The server will start running at http://localhost:4000.


### Instructions to Use MongoDB
Make sure MongoDB is installed and running locally or in the cloud (e.g., MongoDB Atlas).
Adjust the `URI` in the `.env` file based on your MongoDB setup.
The database and collections will be automatically created based on the interactions with the system. No manual creation of collections is required.

### API Documentation
The full API documentation can be found in the `API_DOCUMENTATION.md` file. This file contains details about each endpoint, required parameters, and expected responses.


## Database Structure
Here is an example structure for each collection in your MongoDB database:

Note: In MongoDB, every document in a collection automatically has an _id field, which serves as a unique identifier for that document. If you don't explicitly define an _id, MongoDB will create one for you. 

### Users Collection:
```json
{
  "_id": {
    "$oid": "67139de77440a465212baeb1"
  },
  "name": "Grace Hopper",
  "username": "graceH",
  "email": "g-h@gmail.com",
  "role": "USER",
  "penalty": {
    "reason": "Damaged book",
    "fine": 10
  },
  "created_at": {
    "$date": "2024-10-19T11:54:15.371Z"
  },
  "updated_at": {
    "$date": "2024-10-19T12:37:02.697Z"
  }
}

```

### Books Collection:
```json
{
  "_id": {
    "$oid": "6712db8ccf3c6211e6f058a7"
  },
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "price": 12.5,
  "is_available": 0,
  "created_at": {
    "$date": "2024-10-18T22:05:00.707Z"
  },
  "updated_at": {
    "$date": "2024-10-18T22:05:00.707Z"
  }
}
```

### Loans Collection:
```json
{
  "_id": {
    "$oid": "6712e83a14d7bd203059d090"
  },
  "userId": "6712e68c14d7bd203059d08c",
  "bookId": "6712db8ccf3c6211e6f058a7",
  "loanDate": "2024-10-18T22:59:06.868Z",
  "returnDate": {
    "$date": "2024-11-01T00:00:00.000Z"
  }
}

```

## License
This project is open-source and available under the MIT License.
