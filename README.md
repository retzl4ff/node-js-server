# Node.js Server

This is a Node.js + Express project with Docker setup, JWT authentication (Access and Refresh Tokens)

## Requirements

- Docker

## Running the Project with Docker

### 1. Clone the repository

```
git clone git@github.com:retzl4ff/node-js-server.git
cd node-js-server
```

### 2. Setup Environment Variables
Create a .env file at the root of the project (same level as docker-compose.yml) with the following content:

```
PORT=3000
ACCESS_TOKEN_SECRET=my_access_token_secret
REFRESH_TOKEN_SECRET=my_refresh_token_secret
```

### 3. Build and Run Containers
To build the images and start the containers, use the following command:

```
docker compose up --build
```

The app will be accessible at http://localhost:3000.
