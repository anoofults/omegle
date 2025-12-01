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

        socket.on('partner_found', async ({ initiator }) => {
            setStatus('Partner found! Connecting...');
            setPartnerConnected(true);
            createPeer(initiator);
        });

        socket.on('signal', async ({ signal }) => {
            if (peerRef.current) {
                if (signal.type === 'offer') {
                    await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal));
                    const answer = await peerRef.current.createAnswer();
                    await peerRef.current.setLocalDescription(answer);
                    socket.emit('signal', { signal: answer });
                } else if (signal.type === 'answer') {
                    await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal));
                } else if (signal.candidate) {
                    await peerRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
                }
            }
        });

        socket.on('message', (data: { sender: string, message: string }) => {
            setMessages(prev => [...prev, { sender: data.sender, text: data.message }]);
        });

        socket.on('system_message', (msg: string) => {
            setMessages(prev => [...prev, { sender: 'System', text: msg }]);
        });

        socket.on('partner_disconnected', () => {
            setStatus('Partner disconnected.');
            setPartnerConnected(false);
            closePeer();
        });

        return () => {
            socket.disconnect();
            closePeer();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            setStatus('Camera ready. Searching for partner...');
            socketRef.current?.emit('find_partner');
        } catch (err) {
            console.error('Error accessing camera:', err);
            setStatus('Error accessing camera. Please allow permissions.');
        }
    };

    const findNewPartner = async () => {
        if (partnerConnected) {
            closePeer();
            setPartnerConnected(false);
            setMessages([]);
            socketRef.current?.emit('disconnect_partner');
        }

        // Restart camera if it was stopped
        if (!localStreamRef.current || localStreamRef.current.getTracks().every(t => t.readyState === 'ended')) {
            await startCamera();
        } else {
            setStatus('Searching for partner...');
            setMessages([]);
            socketRef.current?.emit('find_partner');
        }
    };

    const stopChat = () => {
        closePeer();
        setPartnerConnected(false);
        setStatus('Chat stopped. Click Start to find a new partner.');

        // Stop camera and mic
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
        }
    };

    const createPeer = async (initiator: boolean) => {
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' } // Public STUN server
            ]
        });
        peerRef.current = peer;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => peer.addTrack(track, localStreamRef.current!));
        }

        peer.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('signal', { signal: { candidate: event.candidate } });
            }
        };

        if (initiator) {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            socketRef.current?.emit('signal', { signal: offer });
        }
    };

    const closePeer = () => {
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && socketRef.current) {
            socketRef.current.emit('message', { message: input });
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-4 shadow flex justify-between items-center">
                <h2 className="font-bold text-xl">Omegle Clone</h2>
                <div className="text-sm text-gray-400">{status}</div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Video Area */}
                <div className="flex-1 relative bg-black flex items-center justify-center">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 border-2 border-white rounded overflow-hidden">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {!partnerConnected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                            <div className="text-center">
                                <p className="text-xl mb-4">{status}</p>
                                <button
                                    onClick={findNewPartner}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transform transition hover:scale-105"
                                >
                                    Start / Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="w-full md:w-80 bg-white text-black flex flex-col border-l border-gray-300">
                    <div className="flex-1 p-4 overflow-y-auto space-y-2">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`p-2 rounded ${msg.sender === 'You' ? 'bg-blue-100 self-end' : msg.sender === 'System' ? 'bg-gray-200 text-xs text-center' : 'bg-gray-100'}`}>
                                <span className="font-bold text-xs block text-gray-500">{msg.sender}</span>
                                <span>{msg.text}</span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:border-blue-500"
                            disabled={!partnerConnected}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 disabled:bg-gray-400"
                            disabled={!partnerConnected}
                        >
                            Send
                        </button>
                    </form>
                    <div className="p-4 border-t border-gray-200 flex justify-between gap-4">
                        <button
                            onClick={stopChat}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded shadow transition"
                        >
                            Stop
                        </button>
                        <button
                            onClick={findNewPartner}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded shadow transition"
                        >
                            Next
                        </button>
                    </div>
                    <div className="p-2 text-center">
                        <button className="text-xs text-red-500 hover:underline">Report Partner</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoChat;
