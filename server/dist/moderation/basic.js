"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMessage = void 0;
const BAD_WORDS = ['badword1', 'badword2']; // Placeholder
const checkMessage = (message) => {
    const lower = message.toLowerCase();
    for (const word of BAD_WORDS) {
        if (lower.includes(word)) {
            return false;
        }
    }
    return true;
};
exports.checkMessage = checkMessage;
