# Deployment Guide

This guide explains how to deploy the application using Docker and Docker Compose.

## Prerequisites
- [Docker](https://www.docker.com/get-started) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop).

## Deployment Steps

1.  **Navigate to Project Root**:
    Open your terminal and go to the folder containing `docker-compose.yml` (the root of this project).

2.  **Build and Run**:
    Run the following command to build the images and start the containers:
    ```bash
    docker-compose up --build -d
    ```
    - `--build`: Rebuilds the images if you made changes.
    - `-d`: Runs in detached mode (in the background).

3.  **Access the Application**:
    - **Frontend**: Open `http://localhost` (or your server's IP if deploying remotely).
    - **Backend**: The API is available at `http://localhost:3000`.

4.  **Stopping the Application**:
    To stop the containers, run:
    ```bash
    docker-compose down
    ```

## Network Access
If you want to access the app from another device (e.g., friend's laptop) while running with Docker:
- Ensure your firewall allows traffic on ports `80` and `3000`.
- Access via `http://<YOUR_IP_ADDRESS>`.

## Troubleshooting
- **Port Conflicts**: If port 80 or 3000 is already in use, edit `docker-compose.yml` to map to different ports (e.g., `"8080:80"`).
- **Logs**: View logs with `docker-compose logs -f`.
