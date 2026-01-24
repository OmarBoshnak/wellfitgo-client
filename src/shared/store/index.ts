/**
 * Redux Store Configuration
 * @description Configures Redux store with persistence and middleware
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reducers
import healthReducer from './slices/healthSlice';
import bookingReducer from './slices/bookingSlice';
import homeReducer from './slices/homeSlice';
import authReducer, { setHydrated } from './slices/authSlice';
import mealsReducer from './slices/mealsSlice';
import chatReducer from './slices/chatSlice';
import profileReducer from './slices/profileSlice';



// RTK Query APIs



// ============================================================================
// Persist Configuration
// ============================================================================

/**
 * Auth slice persist config
 * Only persist essential auth state, not loading/error states
 */
const authPersistConfig = {
    key: 'auth',
    storage: AsyncStorage,
    whitelist: [
        'isAuthenticated',
        'userId',
        'email',
        'displayName',
        'role',
        'isFirstTimeUser',
        'hasCompletedOnboarding',
        'hasCompletedHealthHistory',
    ],
};

// ============================================================================
// Root Reducer
// ============================================================================

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    health: healthReducer,
    booking: bookingReducer,
    home: homeReducer,
    meals: mealsReducer,
    chat: chatReducer,
    profile: profileReducer,



});

// ============================================================================
// Store Configuration
// ============================================================================

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore redux-persist actions for serializable check
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
    devTools: __DEV__,
});

// ============================================================================
// Persistor
// ============================================================================

export const persistor = persistStore(store, null, () => {
    // Called after rehydration is complete
    store.dispatch(setHydrated(true));
});

// ============================================================================
// Types
// ============================================================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ============================================================================
// Typed Hooks
// ============================================================================

/**
 * Typed version of useDispatch
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
