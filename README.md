<h1 align="center">BookHive Application</h1>

Welcome to the BookHive Backend Application!

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
5. [Database Setup](#database-setup)
6. [Environment Variables](#environment-variables)
7. [Usage](#usage)
8. [API Endpoints](#api-endpoints)
9. [Testing](#testing)
10. [Contributing](#contributing)
11. [License](#license)

## Introduction
This is a backend library interface built using Node.js, Express, Sequelize, and PostgreSQL. It allows users to browse and review books, with separate interfaces and functionalities for admins and users.

## Features
- <b> User Authentication </b>: Registration and login with token-based authentication.
- <b> Security </b>: Passwords are not stored in plain text in the database.
- <b> Password Reset </b>: User's can reset password using nodemailer.
- <b> Book Management </b>: Admins can add, update, or remove books.
- <b> User management </b>: Users can borrow and return books.
- <b> Edit details </b>: Users can edit their details

## Tech Stack
- <b> Backend </b>: Node.js, Express.js
- <b> Database </b>: PostgreSQL, Sequelize ORM
- <b> Authentication </b>: bcrypt for password hashing, jsonwebtoken for token-based authentication

## Installation
### Prerequisites
- Node.js (v14.21.3)
- npm (v6.14.18)
- PostgreSQL (v14.12)

## Steps
- Clone the repository:
`https://github.com/Magret1730/BookHive-Portfolio-Project`
- Install dependencies: `npm install`
- Set up the **[database](./database_setup.md)**
- Configure **[environment](./.env.md)** variables.
- Start the application: `npm start`

The application will be accessible on `http://<host>:<port>`

## API Endpoints

### users endpoint `/api/v1/users`
- Only admin routes
    1. Route to get all users. `GET /`

- Only user routes
    1. Route to delete/deactivate account. `DELETE /deactivate`
    2. Route to edit User details. `PUT /edit`

- Both admin and user routes
    1. Route to register. `POST /register` Supply firstName, lastName, email and password
    2. Route to login. `POST /login`
    3. Route to forgot Password. `PUT /forgotPassword` Supply email
    4. Route to reset Password. `PUT /resetPassword` Supply newPassword and resetLink

### book endpoint `api/v1/books/`
- Both admin and user routes
    1. Route to get all books `GET /`
    2. Route to search books based on title, author or genre `GET /search?genre=sport`

- Only admin routes
    1. Route to add a book `POST /addBook`
    2. Route to deletes book `DELETE /:bookId`
    3. Routes to edit book details `PUT /:bookId`
    4. Routes to get books by ID `GET /:bookId`

### borrow endpoint `api/v1/borrow`
- Only users routes
    1. Route to borrow books. `POST /:bookId`
    2. Route to return books. PUT `/:bookId`
    3. Route to get borrowed history per user. `GET ?page=2&size=10`

- Only admin routes
    1. Route to get users borrowed history. `GET /:userId?page=2&size=10`
    2. Route to get a single book record `GET /:bookId`

## Contributing
Please read the **[Contribution instructions.](./CONTRIBUTING.md)**

## License
This project is licensed under the _MIT License_ - see the **[LICENSE](./LICENSE)**
file for details.

## Credits
BookHive Backend Application was created by Oyedele Abiodun Magret. This is a library interface built using Node.js, Express, Sequelize, and PostgreSQL.

## Contributor
- Oyedele Abiodun Magret [Email](mailto:belloabiodun17@gmail.com) [LinkedIn](https://www.linkedin.com/in/oyedele-abiodun/) [X](https://twitter.com/OyedeleMagret)
