import { http } from './http';

export interface CustomerProfileResponse {
    summary: string;
    tags: string[];
    purchaseIntent: string;
    suggestedStrategy: string;
    personalityTraits?: string;
    priceSensitivity?: string;
    brandPreference?: string;
}

export interface ScriptGenerationResponse {
    script: string;
    tone: string;
    keyPoints: string[];
}

export interface SalesPredictionResponse {
    predictedSales: number;
    confidenceLevel: number;
    trend: string;
    factors: string[];
}

export const aiService = {
    /**
     * Analyze customer profile based on provided data
     */
    analyzeCustomerProfile: (customerData: Record<string, any>) => {
        return http.post<CustomerProfileResponse>('/ai/customer-profile', customerData);
    },

    /**
     * Generate marketing script based on context
     */
    generateScript: (context: Record<string, any>) => {
        return http.post<ScriptGenerationResponse>('/ai/generate-script', context);
    },

    /**
     * Predict sales based on historical data
     */
    predictSales: (historicalData: Record<string, any>) => {
        return http.post<SalesPredictionResponse>('/ai/sales-prediction', historicalData);
    },

    // --- New Methods ---
    getScenarios: () => {
        return http.get<any[]>('/ai/scenarios');
    },

    getScripts: (category?: string) => {
        return http.get<any[]>('/ai/scripts', { params: { category } });
    },

    createScript: (script: any) => {
        return http.post<boolean>('/ai/scripts', script);
    },

    getPersonas: () => {
        return http.get<any[]>('/ai/personas');
    },

    getPersonaDetail: (id: string | number) => {
        return http.get<any>(`/ai/personas/${id}`);
    },

    getBrainStats: () => {
        return http.get<any>('/ai/brain/stats');
    },

    chat: (message: string, context?: any) => {
        return http.post<string>('/ai/chat', { message, context });
    },

    getInsights: () => {
        return http.get<string[]>('/ai/insights');
    }
};

export default aiService;
