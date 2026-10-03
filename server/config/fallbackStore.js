const fs = require('fs');
const path = require('path');

// Local in-memory store with optional JSON persistence for seamless local dev
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    // Ignore if directory creation fails
  }
}

const usersFile = path.join(dataDir, 'users.json');
const interviewsFile = path.join(dataDir, 'interviews.json');

const loadData = (filePath, fallback = []) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading fallback store:', e);
  }
  return fallback;
};

const saveData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing fallback store:', e);
  }
};

let users = loadData(usersFile, []);
let interviews = loadData(interviewsFile, []);

const fallbackStore = {
  // User methods
  findUserByEmail: async (email) => {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: async (id) => {
    return users.find(u => u._id === id || u.id === id);
  },
  createUser: async (userData) => {
    const newUser = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveData(usersFile, users);
    return newUser;
  },
  updateUser: async (id, updateData) => {
    const idx = users.findIndex(u => u._id === id || u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updateData };
      saveData(usersFile, users);
      return users[idx];
    }
    return null;
  },

  // Interview methods
  createInterview: async (interviewData) => {
    const newInterview = {
      _id: 'int_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...interviewData,
      createdAt: new Date().toISOString()
    };
    interviews.push(newInterview);
    saveData(interviewsFile, interviews);
    return newInterview;
  },
  findInterviewsByUserId: async (userId) => {
    return interviews
      .filter(i => i.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  findInterviewById: async (id) => {
    return interviews.find(i => i._id === id || i.id === id);
  },
  deleteInterview: async (id, userId) => {
    const idx = interviews.findIndex(i => (i._id === id || i.id === id) && i.userId === userId);
    if (idx !== -1) {
      interviews.splice(idx, 1);
      saveData(interviewsFile, interviews);
      return true;
    }
    return false;
  }
};

module.exports = fallbackStore;
