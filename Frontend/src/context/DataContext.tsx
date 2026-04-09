import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User, Project, Tag, Organization } from "../components/types";

interface DataContextType {
  users: User[];
  projects: Project[];
  tags: Tag[];
  organization: Organization | null;
  currentUser: User | null;
  getUserById: (id: string) => User | undefined;
  getProjectById: (id: string) => Project | undefined;
  getTagById: (id: string) => Tag | undefined;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({
  children,
  users,
  projects,
  tags,
  organization
}: {
  children: ReactNode;
  users: User[];
  projects: Project[];
  tags: Tag[];
  organization: Organization | null;
}) {
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

  return (
    <DataContext.Provider value={{ 
      users, projects, tags, organization, currentUser, 
      getUserById, getProjectById, getTagById, login, logout 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
