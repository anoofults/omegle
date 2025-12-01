# Omegle Clone MVP

A minimal random video chat application with basic safety features.

## ⚠️ Safety & Legal Disclaimer
This project is a technical MVP. **It is not ready for public launch.**
- **Age Verification**: Includes a basic self-certification checkbox. Real-world usage requires strict age verification (e.g., Yoti, Veriff).
- **Moderation**: Includes a placeholder for keyword filtering. Strict human moderation and advanced AI content analysis are required for safety.
- **Legal**: Consult legal counsel regarding user safety, data privacy (GDPR/CCPA), and liability before deploying.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, WebRTC
- **Backend**: Node.js, Express, Socket.IO, TypeScript

## Prerequisites
- Node.js (v14+)
- npm

## Setup & Running

1. **Clone the repository** (if applicable)

2. **Setup Backend**
   ```bash
   cd server
   npm install
   # Start the server (runs on port 3000)
   npx ts-node src/index.ts
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   # Start the client (runs on port 5173 by default)
   npm run dev
   ```

4. **Usage**
   - Open `http://localhost:5173` in two different browser windows/tabs.
   - Accept the age verification.
   - Click "Start Chatting".
   - Allow camera/microphone access.
   - You should be paired with the other tab.

## Features
- **Random Matching**: Connects users looking for a partner.
- **Video/Audio**: WebRTC peer-to-peer connection.
- **Text Chat**: Real-time messaging via Socket.IO.
- **Moderation**: Basic keyword filtering for text messages.
- **Reporting**: "Report" button (UI only for MVP).

## Project Structure
- `/server`: Backend code
- `/client`: Frontend code
