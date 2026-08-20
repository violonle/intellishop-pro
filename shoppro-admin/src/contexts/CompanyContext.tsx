import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser } from '@/utils/storage';

interface CompanyContextType {
    currentCompanyId: number | undefined;
    setCurrentCompanyId: (id: number | undefined) => void;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentCompanyId, setCurrentCompanyId] = useState<number | undefined>(() => {
        const saved = localStorage.getItem('shoppro_current_company_id');
        return saved ? Number(saved) : undefined;
    });

    const user = getUser();
    const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'platform_admin';
    const isAdmin = isSuperAdmin || user?.role === 'enterprise_admin';

    // 如果是企业管理员，自动锁定为其所属公司 ID
    useEffect(() => {
        if (user?.role === 'enterprise_admin' && user?.enterpriseId) {
            setCurrentCompanyId(user.enterpriseId);
        }
    }, [user]);

    const handleSetCompanyId = (id: number | undefined) => {
        setCurrentCompanyId(id);
        if (id) {
            localStorage.setItem('shoppro_current_company_id', id.toString());
        } else {
            localStorage.removeItem('shoppro_current_company_id');
        }
    };

    return (
        <CompanyContext.Provider value={{
            currentCompanyId,
            setCurrentCompanyId: handleSetCompanyId,
            isAdmin,
            isSuperAdmin
        }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
