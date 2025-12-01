import React, { useState } from 'react';

interface LandingProps {
    onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
    const [agreed, setAgreed] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-4 text-blue-600">Omegle Clone MVP</h1>
                <p className="mb-6 text-gray-700">
                    Meet strangers with random video chat.
                </p>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6 text-left">
                    <h3 className="font-bold text-yellow-800 mb-2">Safety & Age Verification</h3>
                    <p className="text-sm text-yellow-700 mb-2">
                        You must be 18+ to use this service.
                        Inappropriate behavior will be moderated.
                    </p>
                    <label className="flex items-start space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <span className="text-sm text-gray-800">
                            I certify that I am at least 18 years old and agree to the Terms of Service.
                        </span>
                    </label>
                </div>

                <button
                    onClick={onStart}
                    disabled={!agreed}
                    className={`w-full py-3 px-4 rounded font-bold text-white transition-colors ${agreed
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    Start Chatting
                </button>
            </div>
        </div>
    );
};

export default Landing;
