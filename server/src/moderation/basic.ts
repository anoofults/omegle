const BAD_WORDS = ['badword1', 'badword2']; // Placeholder

export const checkMessage = (message: string): boolean => {
    const lower = message.toLowerCase();
    for (const word of BAD_WORDS) {
        if (lower.includes(word)) {
            return false;
        }
    }
    return true;
};
