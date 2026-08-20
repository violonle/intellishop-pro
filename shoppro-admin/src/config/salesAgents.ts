export const SALES_AGENT_DEFINITIONS = {
    sdr: {
        name: '线索预测智能体',
        abbreviation: 'SDR',
        englishName: 'Sales Development Representative',
    },
    customer: {
        name: '客户画像智能体',
        abbreviation: 'CPI',
        englishName: 'Customer Persona Intelligence',
    },
    coach: {
        name: '销售教练智能体',
        abbreviation: 'SCA',
        englishName: 'Sales Coaching Agent',
    },
    marketing: {
        name: '营销运营智能体',
        abbreviation: 'MOA',
        englishName: 'Marketing Operations Agent',
    },
    revenue: {
        name: '营收预测智能体',
        abbreviation: 'RFA',
        englishName: 'Revenue Forecasting Agent',
    },
} as const;

export type SalesAgentKey = keyof typeof SALES_AGENT_DEFINITIONS;

export const getSalesAgentLabel = (key: SalesAgentKey) => {
    const agent = SALES_AGENT_DEFINITIONS[key];
    return `${agent.name}（${agent.abbreviation}）`;
};

export const getSalesAgentTooltip = (key: SalesAgentKey) => {
    const agent = SALES_AGENT_DEFINITIONS[key];
    return `${getSalesAgentLabel(key)} · ${agent.englishName}`;
};
