import React, { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.PROD ? '/' : `http://${window.location.hostname}:3000`;

const VideoChat: React.FC = () => {
    const [status, setStatus] = useState<string>('Connecting to server...');
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [input, setInput] = useState('');
    const [partnerConnected, setPartnerConnected] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        // Initialize Socket
        socketRef.current = io(SERVER_URL);
        const socket = socketRef.current;

        socket.on('connect', () => {
            setStatus('Connected. Waiting for camera access...');
            startCamera();
        });


        export default VideoChat;
