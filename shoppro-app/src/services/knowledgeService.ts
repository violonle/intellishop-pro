import { http } from './http';

export interface Knowledge {
    id?: number;
    title: string;
    content: string;
    categoryId?: number;
    categoryName?: string; // Optional if joined
    tags?: string;
    authorId?: number;
    viewCount?: number;
    likeCount?: number;
    createdAt?: string;
    updatedAt?: string;
    deleted?: number;
}

export const knowledgeService = {
    /**
     * Create a new knowledge article
     */
    createKnowledge: (knowledge: Knowledge) => {
        return http.post<Knowledge>('/knowledge', knowledge);
    },

    /**
     * Update an existing knowledge article
     */
    updateKnowledge: (knowledge: Knowledge) => {
        return http.put<Knowledge>('/knowledge', knowledge);
    },

    /**
     * Delete a knowledge article
     */
    deleteKnowledge: (id: number) => {
        return http.delete<boolean>(`/knowledge/${id}`);
    },

    /**
     * Get knowledge detail by ID
     */
    getKnowledgeDetail: (id: number) => {
        return http.get<Knowledge>(`/knowledge/${id}`);
    },

    /**
     * List knowledge by category
     */
    listByCategory: (categoryId: number) => {
        return http.get<Knowledge[]>(`/knowledge/category/${categoryId}`);
    },

    /**
     * Page query knowledge articles
     */
    getKnowledgeList: (params: { pageNo?: number; pageSize?: number; categoryId?: number; keyword?: string }) => {
        return http.get<{ records: Knowledge[]; total: number; current: number }>('/knowledge/page', { params });
    },

    /**
     * Increment view count
     */
    incrementView: (id: number) => {
        return http.post<boolean>(`/knowledge/${id}/view`);
    },

    /**
     * Like an article
     */
    likeKnowledge: (id: number) => {
        return http.post<boolean>(`/knowledge/${id}/like`);
    },

    /**
     * Get AI/Algorithmic recommendations
     */
    getRecommendations: () => {
        return http.get<string[]>('/knowledge/recommendations');
    }
};

export default knowledgeService;
