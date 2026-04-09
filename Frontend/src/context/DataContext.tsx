import { createContext, useContext } from "react";
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
  const currentUser = users.find(u => u.role === "executive") || users[0] || null;

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getProjectById = (id: string) => projects.find(p => p.id === id);
  const getTagById = (id: string) => tags.find(t => t.id === id);

  return (
    <DataContext.Provider value={{ users, projects, tags, organization, currentUser, getUserById, getProjectById, getTagById }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
