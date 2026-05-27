import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORE_PATH = '/tmp/jiaotu_users.json';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'designer' | 'admin';
  status: 'active' | 'banned' | 'pending';
  avatar?: string;
  works: number;
  createdAt: string;
  updatedAt: string;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'jiaotu-salt').digest('hex');
}

function readUsers(): StoredUser[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

function writeUsers(users: StoredUser[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(users, null, 2));
}

// Initialize with admin account if empty
function ensureAdmin() {
  const users = readUsers();
  if (users.length === 0) {
    users.push({
      id: 'admin-001',
      email: 'admin@jiaotu.ai',
      name: '管理员',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      status: 'active',
      works: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    writeUsers(users);
  }
}

ensureAdmin();

export function registerUser(name: string, email: string, password: string): StoredUser | { error: string } {
  const users = readUsers();

  if (users.find((u) => u.email === email)) {
    return { error: '该邮箱已注册' };
  }

  const newUser: StoredUser = {
    id: 'user-' + Date.now(),
    email,
    name,
    passwordHash: hashPassword(password),
    role: 'user',
    status: 'active',
    works: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  return newUser;
}

export function loginUser(email: string, password: string): StoredUser | { error: string } {
  const users = readUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return { error: '用户不存在' };
  }

  if (user.passwordHash !== hashPassword(password)) {
    return { error: '密码错误' };
  }

  if (user.status === 'banned') {
    return { error: '账号已被封禁' };
  }

  user.updatedAt = new Date().toISOString();
  writeUsers(users);

  return user;
}

export function getAllUsers(): StoredUser[] {
  return readUsers().map((u) => {
    const { passwordHash, ...safe } = u;
    return safe as any;
  });
}

export function updateUserStatus(id: string, status: 'active' | 'banned' | 'pending'): boolean {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;

  users[idx].status = status;
  users[idx].updatedAt = new Date().toISOString();
  writeUsers(users);
  return true;
}

export function updateUserRole(id: string, role: 'user' | 'designer' | 'admin'): boolean {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;

  users[idx].role = role;
  users[idx].updatedAt = new Date().toISOString();
  writeUsers(users);
  return true;
}

export function deleteUser(id: string): boolean {
  const users = readUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  writeUsers(filtered);
  return true;
}

export function getUserById(id: string): Omit<StoredUser, 'passwordHash'> | null {
  const users = readUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}
