import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>;
}

const initialState: UiState = {
    theme: 'light',
    sidebarOpen: true,
    notifications: [],
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },
        addNotification: (state, action: PayloadAction<{ message: string; type: 'info' | 'success' | 'warning' | 'error' }>) => {
            state.notifications.push({
                id: Date.now().toString(),
                ...action.payload,
            });
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter((n) => n.id !== action.payload);
        },
    },
});

export const { toggleTheme, toggleSidebar, setSidebarOpen, addNotification, removeNotification } = uiSlice.actions;
export default uiSlice.reducer;
