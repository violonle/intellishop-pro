import React, { useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
import { getEnterprisePage } from '@/services/enterprise';
import { useCompany } from '@/contexts/CompanyContext';

const { Option } = Select;

const CompanySelector: React.FC = () => {
    const { currentCompanyId, setCurrentCompanyId, isSuperAdmin } = useCompany();
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isSuperAdmin) {
            fetchCompanies();
        }
    }, [isSuperAdmin]);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const res = await getEnterprisePage({ pageNo: 1, pageSize: 100 });
            const response = res as any;
            if (response?.records) {
                setCompanies(response.records);
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isSuperAdmin) return null;

    return (
        <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">当前视角:</span>
            <Select
                showSearch
                placeholder="请选择企业"
                optionFilterProp="children"
                value={currentCompanyId}
                onChange={setCurrentCompanyId}
                loading={loading}
                style={{ width: 220 }}
                variant="filled"
                className="company-select-modern"
                notFoundContent={loading ? <Spin size="small" /> : null}
            >
                {companies.map(company => (
                    <Option key={company.id} value={company.id}>
                        {company.name}
                    </Option>
                ))}
            </Select>
        </div>
    );
};

export default CompanySelector;
