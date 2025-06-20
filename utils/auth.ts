// Basic authentication utility (mock implementation)

export async function login(email: string, password: string) {
  // Simulate login
  return { id: '1', name: 'Test User', email };
}

export async function logout() {
  // Simulate logout
  return true;
}

export async function getCurrentUser() {
  // Simulate getting the current user
  return { id: '1', name: 'Test User', email: 'test@example.com' };
} 