# Library Web App & Database

## Description

A web application project developed to simulate a theoretical library's web app and database system.

## Functionality

### Patron functionality

Patrons are the regular users of the site and are able to pay fines, search for items, and hold items. They are separated into three roles of patrons, those being patrons, students, and faculty, all with differing fines and loan periods.

### Staff Functionality

Staff are the upper level users of the site, and are separated into staff and admins.
Staff can enter and manage items, hold items for and check out items to patrons, return items to the system, mark items as lost, manage user fines, and more.
Admins can do everything staff can do in addition to managing users, view reports, and sign up new staff accounts.

## Installation

### Requirements

- Node.js
- MySQL

### Steps
1. Create a MySQL server in MySQL Workbench and connect to it

2. Import the SQL files and run them in MySQL Workbench
    1. import `library_database.sql`
    2. run `library_database.sql`
    3. import `initial_data.sql`
    4. run `initial_data.sql`

3. Create an environment file in the backend folder

    This is what should be in the file:

    ```env
    PORT=3000
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=(your MySQL password)
    DB_NAME=library_database
    ```

4. Using terminal, run this cmd at the root of the project:

    ```bash
    npm run setup
    ```

5. To start the site, run this cmd in terminal at the root of the project:

    ```bash
    npm run dev
    ```

6. Enjoy! ☺️
