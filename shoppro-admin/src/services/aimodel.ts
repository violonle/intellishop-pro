import request from '@/utils/request';

export interface AiModel {
    id: number;
    name: string;
    provider: string;
    version: string;
    status: number;
    rpm: string;
    apiKey?: string;
    baseUrl?: string;
}

export interface AiScenario {
    id: number;
    code: string;
    name: string;
    description: string;
    category?: string;
    modelConfig: string;
    isEnabled: boolean;
}

export const getAllAiModels = () => {
    return request({
        url: '/ai-models',
        method: 'get',
    });
};

export const createAiModel = (data: Partial<AiModel>) => {
    return request({
        url: '/ai-models',
        method: 'post',
        data,
    });
};

export const updateAiModel = (id: number, data: Partial<AiModel>) => {
    return request({
        url: `/ai-models/${id}`,
        method: 'put',
        data,
    });
};

export const toggleAiModelStatus = (id: number) => {
    return request({
        url: `/ai-models/${id}/status`,
        method: 'put',
    });
};

export const deleteAiModel = (id: number) => {
    return request({
        url: `/ai-models/${id}`,
        method: 'delete',
    });
};

export const getScenarios = () => {
    return request({
        url: '/ai/scenarios/list',
        method: 'get',
    });
};

export const updateScenarioCategory = (category: string, modelName: string) => {
    return request({
        url: '/ai/scenarios/category',
        method: 'put',
        data: { category, model: modelName },
    });
};
