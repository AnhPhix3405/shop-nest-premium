// API Endpoints Configuration for ShopNest
// export const API_BASE_URL = 'https://shop-nest-premium.onrender.com/api';
export const API_BASE_URL = 'http://localhost:4000/api';

// ===== AUTH ENDPOINTS =====
export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',          // POST - Public: Register customer/seller (role_id: 3 or 4)
  LOGIN: '/auth/login',                // POST - Public: User login
  REFRESH: '/auth/refresh',            // POST - Public: Refresh access token
  LOGOUT: '/auth/logout',              // POST - Auth: Logout from current device
  LOGOUT_ALL: '/auth/logout-all',      // POST - Auth: Logout from all devices
} as const;

// ===== USER ENDPOINTS =====
export const USER_ENDPOINTS = {
  CREATE: '/users',                    // POST - Admin only: Create user with any role
  GET_ALL: '/users/get-all',           // GET - Admin only: Get all users
  COUNT: '/users/count',               // GET - Admin only: Get users count
  SEARCH: '/users/search',             // GET - Admin only: Search users (?email= or ?username=)
  GET_BY_ROLE: '/users/role',          // GET - Admin only: Get users by role (/users/role/:roleId)
  GET_BY_ID: '/users',                 // GET - Auth: Get user by ID (/users/:id) - own profile or admin
  UPDATE_PROFILE: '/users/profile',    // PATCH - Auth: Update own profile
  UPDATE: '/users',                    // PATCH - Admin only: Update user (/users/:id)
  DELETE: '/users',                    // DELETE - Admin only: Delete user (/users/:id)
  VERIFY: '/users',                    // PATCH - Admin only: Verify user (/users/:id/verify)
  UNVERIFY: '/users',                  // PATCH - Admin only: Unverify user (/users/:id/unverify)
} as const;

// ===== ENDPOINT BUILDERS =====
export const buildEndpoint = {
  // Auth endpoints (no parameters needed)
  auth: {
    register: () => AUTH_ENDPOINTS.REGISTER,
    login: () => AUTH_ENDPOINTS.LOGIN,
    refresh: () => AUTH_ENDPOINTS.REFRESH,
    logout: () => AUTH_ENDPOINTS.LOGOUT,
    logoutAll: () => AUTH_ENDPOINTS.LOGOUT_ALL,
  },
  
  // User endpoints
  users: {
    create: () => USER_ENDPOINTS.CREATE,
    getAll: () => USER_ENDPOINTS.GET_ALL,
    count: () => USER_ENDPOINTS.COUNT,
    search: (params?: { email?: string; username?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.email) queryParams.append('email', params.email);
      if (params?.username) queryParams.append('username', params.username);
      return `${USER_ENDPOINTS.SEARCH}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    },
    getByRole: (roleId: number) => `${USER_ENDPOINTS.GET_BY_ROLE}/${roleId}`,
    getById: (id: number) => `${USER_ENDPOINTS.GET_BY_ID}/${id}`,
    updateProfile: () => USER_ENDPOINTS.UPDATE_PROFILE,
    update: (id: number) => `${USER_ENDPOINTS.UPDATE}/${id}`,
    delete: (id: number) => `${USER_ENDPOINTS.DELETE}/${id}`,
    verify: (id: number) => `${USER_ENDPOINTS.VERIFY}/${id}/verify`,
    unverify: (id: number) => `${USER_ENDPOINTS.UNVERIFY}/${id}/unverify`,
  },
} as const;

// ===== ALL ENDPOINTS OBJECT =====
export const API_ENDPOINTS = {
  ...AUTH_ENDPOINTS,
  ...USER_ENDPOINTS,
  BASE_URL: API_BASE_URL,
} as const;

export default API_ENDPOINTS;
