import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User, Project, Tag, Organization } from "../components/types";
import { authService } from "../services/auth.service";

interface DataContextType {
  users: User[];
  projects: Project[];
  tags: Tag[];
  organization: Organization;
  currentUser: User | null;
  getUserById: (id: string) => User | undefined;
  getProjectById: (id: string) => Project | undefined;
  getTagById: (id: string) => Tag | undefined;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: Partial<User>) => Promise<User | null>;
  refreshCurrentUser: (newData: Partial<User>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Normalize a user to ensure required fields always exist (handles legacy/signup users)
const normalizeUser = (u: User): User => ({
  ...u,
  workload: u.workload ?? ("available" as any),
  status: u.status ?? "active",
  email: u.email ?? `${u.username ?? u.id}@kinetic.cmd`,
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getProjectById = (id: string) => projects.find(p => p.id === id);
  const getTagById = (id: string) => tags.find(t => t.id === id);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = await authService.login(username, password);
      // El backend envía el usuario. Lo normalizamos para el frontend:
      const normalizedUser = normalizeUser(user);
      
      setCurrentUser(normalizedUser);
      localStorage.setItem("obsidian_user", JSON.stringify(normalizedUser));
      
      // Actualizar la lista de usuarios cacheada si el usuario no estaba (opcional):
      setUsers(prev => {
        if (!prev.find(u => u.id === normalizedUser.id)) {
          return [...prev, normalizedUser];
        }
        return prev;
      });

      return true;
    } catch (error) {
      console.error("Login fallido:", error);
      throw error; // Propagamos el error para que LoginPage lo maneje e imprima
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("obsidian_user");
  };

  const signup = async (userData: Partial<User>) => {
    try {
      if (!userData.username || !userData.password || !userData.name) return null;
      const plainPassword = userData.password;

      const newUser: User = {
        id: `u-${Date.now()}`,
        name: userData.name,
        username: userData.username,
        password: plainPassword,
        role: "member",
        initials: userData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
        avatar_color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
        workload: "available" as any,
        email: `${userData.username}@kinetic.cmd`,
        status: "active",
      };

      // Se delegó a authService (Axios)
      const savedUser = await authService.signup({
        name: newUser.name,
        email: newUser.email,
        password_hash: plainPassword, // El hook del backend lo hasheará
      }); 
      // El backend devuelve id, etc. Asignamos los campos calculados del front si faltan.
      const userConID = {
         ...newUser,
         id: savedUser.id // Tomamos el ID oficial de la BD
      };

      const normalized = normalizeUser(userConID);
      
      setUsers(prev => [...prev, normalized]);
      setCurrentUser(normalized);
      localStorage.setItem("obsidian_user", JSON.stringify(normalized));
      return normalized;
    } catch (err: any) {
      console.error("Signup failed:", err);
      throw err; // Lanza para que SignupPage maneje el Catch
    }
  };

  const refreshCurrentUser = (newData: Partial<User>) => {
    setCurrentUser(prev => prev ? { ...prev, ...newData, avatar_updated_at: Date.now() } : null);
  };

  return (
    <DataContext.Provider value={{ 
      users, projects, tags, organization, currentUser, 
      getUserById, getProjectById, getTagById, login, logout, signup,
      refreshCurrentUser
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
