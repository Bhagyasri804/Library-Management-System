const API_BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getCurrentUser: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Admin Stats
  getAdminStats: () => request('/admin/stats'),

  // Books
  getBooks: (search = '') => request(`/admin/books${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getBookById: (id) => request(`/admin/books/${id}`),
  createBook: (book) => request('/admin/books', { method: 'POST', body: JSON.stringify(book) }),
  updateBook: (id, book) => request(`/admin/books/${id}`, { method: 'PUT', body: JSON.stringify(book) }),
  deleteBook: (id) => request(`/admin/books/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/admin/categories'),
  createCategory: (category) => request('/admin/categories', { method: 'POST', body: JSON.stringify(category) }),
  updateCategory: (id, category) => request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(category) }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),

  // User Management
  getUsers: (role = '') => request(`/admin/users${role ? `?role=${role}` : ''}`),
  createLibrarian: (librarian) => request('/admin/librarians', { method: 'POST', body: JSON.stringify(librarian) }),
  updateUserStatus: (id, active) => request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ active }) }),

  // Librarian Endpoints
  getLibrarianStats: () => request('/librarian/stats'),
  getLibrarianStudents: (search = '') => request(`/librarian/students${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  registerStudentByLibrarian: (student) => request('/librarian/students', { method: 'POST', body: JSON.stringify(student) }),
  getLibrarianBooks: (search = '') => request(`/librarian/books${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  issueBook: (payload) => request('/librarian/issue', { method: 'POST', body: JSON.stringify(payload) }),
  getIssuedBooks: (search = '') => request(`/librarian/issued-books${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  returnBook: (recordId) => request(`/librarian/return/${recordId}`, { method: 'POST' }),

  // Student Endpoints
  getStudentDashboard: () => request('/student/dashboard'),
  getStudentBooks: (search = '', categoryId = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);
    const queryString = params.toString();
    return request(`/student/books${queryString ? `?${queryString}` : ''}`);
  },
  getStudentBorrowedBooks: () => request('/student/borrowed-books'),
  getStudentReservations: () => request('/student/reservations'),
  reserveBook: (bookId) => request(`/student/reservations/${bookId}`, { method: 'POST' }),
  cancelReservation: (id) => request(`/student/reservations/${id}`, { method: 'DELETE' }),
  getStudentFines: () => request('/student/fines'),
  getStudentProfile: () => request('/student/profile'),
  updateStudentProfile: (profile) => request('/student/profile', { method: 'PUT', body: JSON.stringify(profile) }),
};
