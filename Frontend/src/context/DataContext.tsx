import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User, Project, Tag, Organization } from "../components/types";
import { signupUser } from "../api";

interface DataContextType {
  users: User[];
  projects: Project[];
  tags: Tag[];
  organization: Organization;
  currentUser: User | null;
  getUserById: (id: string) => User | undefined;
  getProjectById: (id: string) => Project | undefined;
  getTagById: (id: string) => Tag | undefined;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  signup: (userData: Partial<User>) => Promise<User | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Normalize a user to ensure required fields always exist (handles legacy/signup users)
const normalizeUser = (u: User): User => ({
  workload: "available" as any,
  status: "active",
  email: `${u.username ?? u.id}@kinetic.cmd`,
  ...u,
});

export const DataProvider = ({ 
  children, users: initialUsers, projects, tags, organization 
}: { 
  children: ReactNode;
  users: User[];
  projects: Project[];
  tags: Tag[];
  organization: Organization;
}) => {
  const [users, setUsers] = useState<User[]>(initialUsers.map(normalizeUser));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("obsidian_user");
    return saved ? JSON.parse(saved) : null;
  });

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getProjectById = (id: string) => projects.find(p => p.id === id);
  const getTagById = (id: string) => tags.find(t => t.id === id);

  const login = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("obsidian_user", JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("obsidian_user");
  };

  const signup = async (userData: Partial<User>) => {
    try {
      if (!userData.username || !userData.password || !userData.name) return null;

      const newUser: User = {
        id: `u-${Date.now()}`,
        name: userData.name,
        username: userData.username,
        password: userData.password,
        role: "member",
        initials: userData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
        avatar_color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
        workload: "available" as any,
        email: `${userData.username}@kinetic.cmd`,
        status: "active",
      };

      const savedUser = await signupUser(newUser);
      const normalized = normalizeUser(savedUser);
      setUsers(prev => [...prev, normalized]);
      setCurrentUser(normalized);
      localStorage.setItem("obsidian_user", JSON.stringify(normalized));
      return normalized;
    } catch (err) {
      console.error("Signup failed:", err);
      return null;
    }
  };

  return (
    <DataContext.Provider value={{ 
      users, projects, tags, organization, currentUser, 
      getUserById, getProjectById, getTagById, login, logout, signup 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
