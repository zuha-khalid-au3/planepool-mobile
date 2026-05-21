import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { appStorage } from '../services/appStorage';
import { apiClient } from '../services/api';

const AuthContext = createContext(undefined);

const initialState = {
  isLoading: true,
  isSignout: false,
  user: null,
  userToken: null,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        userToken: action.payload,
        isLoading: false,
      };
    case 'SIGN_IN_SUCCESS':
      return {
        ...state,
        isSignout: false,
        user: action.payload.user,
        userToken: action.payload.token,
        error: null,
        isLoading: false,
      };
    case 'SIGN_UP_SUCCESS':
      return {
        ...state,
        isSignout: false,
        user: action.payload.user,
        userToken: action.payload.token,
        error: null,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        user: null,
        userToken: null,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await appStorage.getItem('accessToken');
        if (token) {
          const profileResponse = await apiClient.getProfile();
          if (profileResponse.success && profileResponse.data) {
            dispatch({
              type: 'SIGN_IN_SUCCESS',
              payload: {
                user: profileResponse.data,
                token,
              },
            });
          } else {
            dispatch({
              type: 'RESTORE_TOKEN',
              payload: null,
            });
          }
        } else {
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: null,
          });
        }
      } catch (error) {
        console.error('Bootstrap error:', error);
        dispatch({
          type: 'RESTORE_TOKEN',
          payload: null,
        });
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      const response = await apiClient.login(email, password);
      if (response.success) {
        const profileResponse = await apiClient.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch({
            type: 'SIGN_IN_SUCCESS',
            payload: {
              user: profileResponse.data,
              token: response.data?.accessToken || '',
            },
          });
        }
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response.error || 'Login failed',
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'An error occurred during login',
      });
    }
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    try {
      const response = await apiClient.signup(email, password, name);
      if (response.success) {
        const profileResponse = await apiClient.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch({
            type: 'SIGN_UP_SUCCESS',
            payload: {
              user: profileResponse.data,
              token: response.data?.accessToken || '',
            },
          });
        }
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response.error || 'Signup failed',
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'An error occurred during signup',
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiClient.logout();
      dispatch({ type: 'SIGN_OUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'SIGN_OUT' });
    }
  }, []);

  const signInWithPhone = useCallback(async (phoneNumber) => {
    try {
      const response = await apiClient.verifyPhone(phoneNumber);
      if (response.success) {
        dispatch({ type: 'CLEAR_ERROR' });
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response.error || 'Failed to send OTP',
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'An error occurred',
      });
    }
  }, []);

  const confirmOtp = useCallback(async (phoneNumber, otp) => {
    try {
      const response = await apiClient.confirmOtp(phoneNumber, otp);
      if (response.success) {
        const profileResponse = await apiClient.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch({
            type: 'SIGN_IN_SUCCESS',
            payload: {
              user: profileResponse.data,
              token: response.data?.accessToken || '',
            },
          });
        }
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response.error || 'OTP verification failed',
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'An error occurred',
      });
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      const response = await apiClient.updateProfile(data);
      if (response.success && response.data) {
        dispatch({
          type: 'SIGN_IN_SUCCESS',
          payload: {
            user: response.data,
            token: state.userToken || '',
          },
        });
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response.error || 'Failed to update profile',
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'An error occurred',
      });
    }
  }, [state.userToken]);

  const value = {
    state,
    signIn,
    signUp,
    signOut,
    signInWithPhone,
    confirmOtp,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
