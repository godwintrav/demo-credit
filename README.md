# Demo Credit Wallet Application

## Overview

The Demo Credit Wallet Application is a secure platform that allows users to create accounts, fund their accounts, withdraw funds, and transfer money between users. This application is built using Node.js, Express, and TypeScript, with a MySql database for persistent and consistent storage.

Core Documentation breakdown can be read here: https://brawny-lamb-149.notion.site/GODWIN-ODENIGBO-LENDSQR-TASK-BREAKDOWN-1311c8cd721f805abe4fd7d5455ac6da?pvs=4

## Features

- **User Registration**: Users can create an account by providing necessary information.
- **Account Funding**: Users can deposit funds into their accounts.
- **Withdrawal**: Users can withdraw funds from their accounts.
- **Fund Transfer**: Users can transfer funds to other users via their email.
- **Transaction History**: Users can view their transaction history for transparency.
- **View Account**: Users can view their account information.

## Getting Started

### Installation

1. Clone the repository:

```bash
   git clone https://github.com/godwintrav/demo-credit.git
   cd demo-credit
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

   Create a .env file in the root directory and add the following variables:
```bash
    DB_HOST=<YOUR-DB-HOST>
    DB_USER=<YOUR-DB-USER>
    DB_PASSWORD=<YOUR-DB-PASSWORD>
    DB_NAME=<YOUR-DB-NAME>
    DB_PORT=<YOUR-DB-PORT>
    NODE_ENV=development
    JWT_SECRET=<YOUR-JWT-SECRET>
    PORT=<APP-PORT>
    KARMA_API_KEY=<YOUR-KARMA-API-KEY>
```

### Running the application

1. Development mode with hot reload:

```bash
npm run dev
```

2. Production mode without docker:

```bash
npm run build
npm run start
```

3. Production mode with docker:

```bash
npm run docker:build:image
npm run docker:run:container
```

### Running Tests

 To run test suites with jest use the following command:

 ```bash
npm run test
```


## Architecture

This application uses a modular design architecture in a monolith application. This approach allows separation of concerns, enabling different components of the application to be developed, tested, and maintained independently while still operating as a cohesive unit. 

The three modules are `User` Module, `Account` Module, `Transaction` Module. Below is an architecture diagram of the application.

![Diagram](./docs/demo-credit-architecture.drawio.png)

The `User` module handles every feature related to user and authentication like login, register and generating tokens. While the `Account` module handles everything related to an account like funding, withdrawal and transfers and the `Transactions` module handles everything related to a user transaction history.

The main advantages and reasons for this design decision is with a modular architecture we can easily achieve scalabilty if needed as specific modules can be extracted and transitioned into microservices without a complete rewrite of the application. Also it's a lot more easier to maintain as one can focus on which module do changes need to be made without being bothered about the others. 

## Database

This application database has three tables `Users`, `Transactions` and `Accounts`. Below is a database ER diagram showing the relationships between the tables.

![Diagram](./docs/demo-credit-db_1.png)

As you can see above the `Users` table has a one to many relationship with the `Transactions` tables because each user will have multiple transactions stored on the table connected to that user. Also the `Users` table has a one to one relationship with the `Accounts` table because a user can only have one account which is referenced by the `user.id` and `account.user_id`;


### Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL
- **ORM**: Knex.js
- **Testing Framework**: Jest

## API Endpoints

### User Registration

- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
    ```json
    {
    "name": "user name",
    "address": "address",
    "email": "test@gmail.com",
    "city": "Enugu",
    "date_of_birth": "2001-01-12",
    "lga_id": "12",
    "password": "password"
    }
    ```
- **Response**:
    - **Success**: `statusCode: 201`
    ```json
    {
    "user": {
        "id": 8,
        "email": "test@gmail.com",
        "name": "user name",
        "date_of_birth": "2001-01-12T00:00:00.000Z",
        "lga_id": 12,
        "city": "Enugu",
        "address": "11 Animat Street",
        "created_at": "2024-11-01T07:09:53.000Z",
        "updated_at": "2024-11-01T07:09:53.000Z"
    },
    "message": "success"
    }
    ```
    - **Error**: `statusCode: 400`
    ```json
    {
    "message": "User with email address already exists"
    }
    ```

### User Login

- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
    ```json
    {
    "email": "godwintrav@gmail.com",
    "password": "123456"
    }
    ```
- **Response**:
    - **Success**: `statusCode: 200`
    ```json
    {
    "user": {
        "id": 1,
        "email": "godwintrav@gmail.com",
        "name": "Godwin Odenigbo",
        "date_of_birth": "2001-01-12T00:00:00.000Z",
        "lga_id": 12,
        "city": "Enugu",
        "address": "11 Animat Street",
        "created_at": "2024-10-31T16:24:06.000Z",
        "updated_at": "2024-10-31T16:24:06.000Z"
    },
    "message": "success",
    "token": "token"
    }
    ```
    - **Error**: `statusCode: 401`
    ```json
    {
    "message": "Invalid email or password"
    }
    ```

### Fund User Account

- **Endpoint**: `POST /api/account/fund`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
    ```json
    {
      "amount": 100
    }
    ```
- **Response**:
    - **Success**: `statusCode: 200`
    ```json
    {
    "message": "success",
    "account": {
        "id": 1,
        "user_id": 1,
        "balance": 5000,
        "created_at": "2024-10-31T16:24:06.000Z",
        "updated_at": "2024-10-31T16:24:06.000Z"
    }
    }
    ```
    - **Error**: `statusCode: 401`
    ```json
    {
    "message": "Invalid token."
    }
    ```

    - **Error**: `statusCode: 404`
    ```json
    {
    "message": "Account not found"
    }
    ```

    - **Error**: `statusCode: 400`
    ```json
    {
    "message": "Invalid Amount"
    }
    ```

### Withdraw Amount

- **Endpoint**: `POST /api/account/withdraw`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
    ```json
    {
      "amount": 100
    }
    ```
- **Response**:
    - **Success**: `statusCode: 200`
    ```json
    {
    "message": "success",
    "account": {
        "id": 1,
        "user_id": 1,
        "balance": 5000,
        "created_at": "2024-10-31T16:24:06.000Z",
        "updated_at": "2024-10-31T16:24:06.000Z"
    }
    }
    ```
    - **Error**: `statusCode: 401`
    ```json
    {
    "message": "Invalid token."
    }
    ```

    - **Error**: `statusCode: 404`
    ```json
    {
    "message": "Account not found"
    }
    ```
    
    - **Error**: `statusCode: 400`
    ```json
    {
    "message": "Invalid Amount"
    }
    ```

    - **Error**: `statusCode: 402`
    ```json
    {
    "message": "Insufficient Funds"
    }
    ```

### Transfer Amount

- **Endpoint**: `POST /api/account/transfer`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
    ```json
    {
      "amount": 1000.00,
      "receiverEmail": "godwintrav12@gmail.com"
    }
    ```
- **Response**:
    - **Success**: `statusCode: 200`
    ```json
    {
    "message": "success",
    "account": {
        "id": 1,
        "user_id": 1,
        "balance": 5000,
        "created_at": "2024-10-31T16:24:06.000Z",
        "updated_at": "2024-10-31T16:24:06.000Z"
    }
    }
    ```
    - **Error**: `statusCode: 401`
    ```json
    {
    "message": "Invalid token."
    }
    ```

    - **Error**: `statusCode: 404`
    ```json
    {
    "message": "Account not found"
    }
    ```
    
    - **Error**: `statusCode: 400`
    ```json
    {
    "message": "Can't transfer to same account"
    }
    ```

    - **Error**: `statusCode: 402`
    ```json
    {
    "message": "Insufficient Funds"
    }
    ```

### Get User Account

- **Endpoint**: `GET /api/account/:userId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
    - **Success**: `statusCode: 200`
    ```json
    {
    "message": "success",
    "account": {
        "balance": "51000.00",
        "id": 2,
        "user_id": 2
    },
    "user": {
        "name": "Godwin Odenigbo",
        "address": "11 Animat Street",
        "city": "Enugu",
        "date_of_birth": "2001-01-12T00:00:00.000Z",
        "email": "godwintrav12@gmail.com",
        "lga_id": 12,
        "id": 2
    }
    }
    ```
    - **Error**: `statusCode: 401`
    ```json
    {
    "message": "Invalid token."
    }
    ```

    - **Error**: `statusCode: 400`
    ```json
    {
    "message": "Invalid user id"
    }
    ```

    - **Error**: `statusCode: 404`
    ```json
    {
    "message": "Account not found"
    }
    ```

### Get User Transactions

- **Endpoint**: `GET /api/transactions/:userId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
    - **Success**: `statusCode: 200`
    ```json
    {
    "transactions": [
        {
            "id": 4,
            "user_id": 2,
            "transaction_type": "transferIn",
            "amount": "5000.00",
            "created_at": "2024-10-31T16:27:01.000Z",
            "updated_at": "2024-10-31T16:27:01.000Z"
        },
        {
            "id": 11,
            "user_id": 2,
            "transaction_type": "withdraw",
            "amount": "5000.00",
            "created_at": "2024-11-01T05:56:09.000Z",
            "updated_at": "2024-11-01T05:56:09.000Z"
        },
    ],
    "message": "success"
    }
    ```
    - **Error**: `statusCode: 401`
    ```json
    {
    "message": "Invalid token."
    }
    ```

    - **Error**: `statusCode: 404`
    ```json
    {
    "message": "User not found"
    }
    ```

    - **Error**: `statusCode: 400`
    ```json
    {
    "message": "Invalid user id"
    }
    ```