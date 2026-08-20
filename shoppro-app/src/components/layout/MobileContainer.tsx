import React from 'react';

interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
    showBottomNav?: boolean;
}

/**
 * A reusable wrapper that simulates a mobile device frame on desktop
 * and ensures full-screen mobile behavior on mobile devices.
 */
const MobileContainer: React.FC<MobileContainerProps> = ({ children, className = "", showBottomNav = false }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            {/* Mobile Container Simulation */}
            <div className={`w-full max-w-[480px] min-h-screen bg-white shadow-2xl relative flex flex-col ${className}`}>
                {/* Content Area */}
                <div className={`flex-1 overflow-y-auto overflow-x-hidden ${showBottomNav ? 'pb-[80px]' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MobileContainer;
