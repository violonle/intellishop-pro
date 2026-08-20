import React from 'react';
import { Outlet } from 'react-router-dom';
import AppBottomNav from './BottomNav';
import MobileContainer from './MobileContainer';

const MobileLayout: React.FC = () => {
    return (
        <MobileContainer showBottomNav={true}>
            <Outlet />
            {/* Bottom Navigation */}
            <div className="absolute bottom-0 w-full z-50 max-w-[480px] left-0 right-0 mx-auto">
                <AppBottomNav />
            </div>
        </MobileContainer>
    );
};

export default MobileLayout;
