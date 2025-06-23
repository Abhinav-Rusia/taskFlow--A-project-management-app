import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

// Reducer for managing auth state
const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case "REGISTER_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "AUTH_CHECK_COMPLETE":
      return { ...state, loading: false };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  axios.defaults.baseURL = import.meta.env.VITE_API_URL;

  // Check auth status when app loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          await getCurrentUser();
        } else {
          dispatch({ type: "AUTH_CHECK_COMPLETE" });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        dispatch({ type: "AUTH_CHECK_COMPLETE" });
      }
    };
    checkAuthStatus();
  }, []);

  // Fetch current user
  const getCurrentUser = async () => {
    try {
      const response = await axios.get("/auth/me");
      if (response.data.success) {
        dispatch({ type: "LOGIN_SUCCESS", payload: response.data.user });
      } else {
        throw new Error("Failed to get user data");
      }
    } catch (error) {
      console.error("Get current user failed:", error);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      dispatch({ type: "AUTH_CHECK_COMPLETE" });
      throw error;
    }
  };

  // Helper method to get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Helper method to check if user has specific role in a project
  const hasProjectRole = useCallback((projectId, requiredRole = null) => {
    if (!state.user || !projectId) return false;
    
    // If user is admin, they have access to everything
    if (state.user.role === 'admin') return true;
    
    // Check if user is member of the project
    const membership = state.user.projects?.find(p => p.project === projectId);
    if (!membership) return false;
    
    // If no specific role required, just being a member is enough
    if (!requiredRole) return true;
    
    // Check specific role
    const roleHierarchy = { 'member': 1, 'admin': 2, 'owner': 3 };
    return roleHierarchy[membership.role] >= roleHierarchy[requiredRole];
  }, [state.user]);

  // Helper method to get user's role in a project
  const getUserProjectRole = useCallback((projectId) => {
    if (!state.user || !projectId) return null;
    
    if (state.user.role === 'admin') return 'admin';
    
    const membership = state.user.projects?.find(p => p.project === projectId);
    return membership?.role || null;
  }, [state.user]);

  // Login handler
  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await axios.post("/auth/login", { email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        dispatch({ type: "LOGIN_SUCCESS", payload: user });
        toast.success("Login successful!");
        return { success: true };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.post('/auth/register', userData);
      if (response.data.success) {
        toast.success('Registration successful! Please check your email for OTP.');
        dispatch({ type: 'REGISTER_SUCCESS' });
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Verify OTP
  const verifyOTP = async (email, otp) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await axios.post("/auth/verify-otp", { email, otp });
      if (response.data.success) {
        toast.success("Email verified successfully! You can now login.");
        dispatch({ type: "CLEAR_ERROR" });
        dispatch({ type: "SET_LOADING", payload: false });
        return { success: true };
      } else {
        throw new Error(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "OTP verification failed";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully!");
  };

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Refresh user data (useful after project changes)
  const refreshUser = useCallback(async () => {
    if (state.isAuthenticated) {
      try {
        await getCurrentUser();
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    }
  }, [state.isAuthenticated]);

  // Check if current user can manage a specific project
  const canManageProject = useCallback((projectId) => {
    return hasProjectRole(projectId, 'admin');
  }, [hasProjectRole]);

  // Check if current user can assign tasks in a project
  const canAssignTasks = useCallback((projectId) => {
    return hasProjectRole(projectId, 'admin');
  }, [hasProjectRole]);

  // Provide values
  const value = {
    ...state,
    login,
    register,
    verifyOTP,
    logout,
    clearError,
    refreshUser,
    getAuthHeaders,
    hasProjectRole,
    getUserProjectRole,
    canManageProject,
    canAssignTasks,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
