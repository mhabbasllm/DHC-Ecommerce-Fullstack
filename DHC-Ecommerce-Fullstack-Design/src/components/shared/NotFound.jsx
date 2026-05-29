import React from 'react';
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react';

const NotFound = ({ onNavigate }) => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-bg-main animate-fade-in">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Animated Error Icon */}
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto animate-bounce duration-1000">
                        <AlertCircle size={48} className="text-red-500" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-md shadow-sm">
                        <Search size={16} className="text-brand-blue" />
                    </div>
                </div>

                <div>
                    <h1 className="text-8xl font-black text-brand-dark mb-2 tracking-tighter">404</h1>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Page Not Found</h2>
                    <p className="text-gray-500 max-w-xs mx-auto">
                        Sorry, the page you are looking for doesn't exist or has been moved to a new location.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                    >
                        <Home size={20} />
                        Back to Home
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                </div>

                {/* Quick Links / Help */}
                <div className="pt-12 border-t border-gray-100 italic">
                    <p className="text-sm text-gray-400">
                        Need help? <span className="text-brand-blue font-semibold cursor-pointer hover:underline">Contact Support</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
