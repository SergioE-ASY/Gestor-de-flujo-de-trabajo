import { createContext, useContext, useState, useEffect } from "react";
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

export const DataProvider = ({ 
  children, users: initialUsers, projects, tags, organization 
}: { 
  children: ReactNode;
  users: User[];
  projects: Project[];
  tags: Tag[];
  organization: Organization;
}) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
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
    console.log("DataContext logout called");
    setCurrentUser(null);
    localStorage.removeItem("obsidian_user");
  };

  const signup = async (userData: Partial<User>) => {
    try {
      // Basic validation
      if (!userData.username || !userData.password || !userData.name) return null;

      const newUser: User = {
        id: `u-${Date.now()}`,
        name: userData.name,
        username: userData.username,
        password: userData.password,
        role: "member", // Default role
        initials: userData.name.split(" ").map(n => n[0]).join("").toUpperCase(),
        avatar_color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`, // Random color
        email: `${userData.username}@kinetic.cmd`,
        status: "active"
      };

      const savedUser = await signupUser(newUser);
      setUsers(prev => [...prev, savedUser]);
      setCurrentUser(savedUser);
      localStorage.setItem("obsidian_user", JSON.stringify(savedUser));
      return savedUser;
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
