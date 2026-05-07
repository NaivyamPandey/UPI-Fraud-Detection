export function isLoggedIn() {
  return !!sessionStorage.getItem('upiShieldToken');
}

export function getCurrentUser() {
  const user = sessionStorage.getItem('upiShieldUser');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  sessionStorage.removeItem('upiShieldToken');
  sessionStorage.removeItem('upiShieldUser');
}

export function getUsers() {
  const usersJson = localStorage.getItem('upiShieldUsers');
  return usersJson ? JSON.parse(usersJson) : {};
}

export function saveUsers(users) {
  localStorage.setItem('upiShieldUsers', JSON.stringify(users));
}

export function signupMock(username, password) {
  if (!username || !password) {
    return { success: false, message: 'Username and password are required.' };
  }

  const users = getUsers();
  if (users[username]) {
    return { success: false, message: 'Username already exists. Please choose another.' };
  }

  users[username] = password;
  saveUsers(users);
  return { success: true, message: 'Account created successfully! You can now login.' };
}

export function loginMock(username, password) {
  if (!username || !password) {
    return { success: false, message: 'Username and password are required.' };
  }

  const users = getUsers();
  if (!users[username]) {
    return { success: false, message: 'Username not found. Please sign up first.' };
  }

  if (users[username] !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  setLoggedIn(username);
  return { success: true, message: 'Login successful!' };
}
