"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSignaling = void 0;
const socket_io_1 = require("socket.io");
const basic_1 = require("../moderation/basic");
const users = new Map();
const waitingQueue = [];
const setupSignaling = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        users.set(socket.id, { id: socket.id, partnerId: null });
        socket.on('find_partner', () => {
            const user = users.get(socket.id);
            if (!user)
                return;
            if (user.partnerId) {
                // Already has a partner
                return;
            }
            // If user is already in queue, don't add again
            if (waitingQueue.includes(socket.id)) {
                return;
            }
            if (waitingQueue.length > 0) {
                const partnerId = waitingQueue.shift();
                if (partnerId === socket.id) {
                    // Should not happen if we check includes, but safe guard
                    waitingQueue.push(partnerId);
                    return;
                }
                if (partnerId && users.has(partnerId)) {
                    // Match found
                    const partner = users.get(partnerId);
                    // Double check partner is free
                    if (partner.partnerId) {
                        // Partner got busy?
                        waitingQueue.push(socket.id);
                        return;
                    }
                    user.partnerId = partnerId;
                    partner.partnerId = socket.id;
                    socket.emit('partner_found', { initiator: true });
                    io.to(partnerId).emit('partner_found', { initiator: false });
                }
                else {
                    // Partner disconnected
                    waitingQueue.push(socket.id);
                }
            }
            else {
                waitingQueue.push(socket.id);
            }
        });
        socket.on('signal', (data) => {
            // Relay signal to target
            // In a real app, verify target is the partner
            const user = users.get(socket.id);
            if (user && user.partnerId === data.target) { // Basic security
                io.to(data.target).emit('signal', { sender: socket.id, signal: data.signal });
            }
        });
        socket.on('message', (data) => {
            const user = users.get(socket.id);
            if (user && user.partnerId) {
                if ((0, basic_1.checkMessage)(data.message)) {
                    io.to(user.partnerId).emit('message', { sender: 'Partner', message: data.message });
                    socket.emit('message', { sender: 'You', message: data.message });
                }
                else {
                    socket.emit('system_message', 'Message blocked by moderation.');
                }
            }
        });
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const user = users.get(socket.id);
            if (user && user.partnerId) {
                const partnerId = user.partnerId;
                const partner = users.get(partnerId);
                if (partner) {
                    partner.partnerId = null;
                    io.to(partnerId).emit('partner_disconnected');
                }
            }
            // Remove from queue
            const index = waitingQueue.indexOf(socket.id);
            if (index > -1) {
                waitingQueue.splice(index, 1);
            }
            users.delete(socket.id);
        });
    });
};
exports.setupSignaling = setupSignaling;
//# sourceMappingURL=signaling.js.map