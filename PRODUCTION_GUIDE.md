# Production Deployment Guide (Ubuntu 24 + Nginx + SSL)

This guide assumes you have cloned the repo into `~/omegle` on your Ubuntu VPS.

## 1. Install Docker & Docker Compose

Run the following commands one by one to install Docker on Ubuntu 24:

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker packages:
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation:
sudo docker run hello-world
```

## 2. Start the Application

We updated `docker-compose.yml` to run the client on port `8080` so we can use Nginx on port `80/443` for SSL.

```bash
cd ~/omegle
sudo docker compose up --build -d
```

Check if it's running:
```bash
sudo docker compose ps
```
You should see the client on port `8080` and server on `3000`.

## 3. Install & Configure Nginx (Reverse Proxy)

We will use Nginx on the host to handle the domain and SSL, proxying traffic to our Docker containers.

```bash
sudo apt-get install -y nginx
```

Create a new Nginx config for your domain:

```bash
sudo nano /etc/nginx/sites-available/omegle
```

Paste the following configuration (replace `omegle.chishiya.xyz` with your actual domain if different):

```nginx
server {
    listen 80;
    server_name omegle.chishiya.xyz;

    # Frontend (Client)
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend (Socket.IO)
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/omegle /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 4. Setup SSL (HTTPS) with Certbot

HTTPS is **required** for camera/microphone access.

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d omegle.chishiya.xyz
```

Follow the prompts (enter email, agree to terms). Certbot will automatically update your Nginx config to use HTTPS.

## 5. Final Check

Open `https://omegle.chishiya.xyz` in your browser.
- The lock icon should appear.
- Camera permissions should work.
- You should be able to chat.
