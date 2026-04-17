import type { User } from "../components/types";
import { authService } from "./auth.service";

export type NewUserForm = {
  name: string;
  email: string;
  password: string;
  role: "manager" | "member";
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapApiRoleToUi(role: string | undefined): User["role"] {
  if (role === "manager") return "manager";
  if (role === "admin") return "executive";
  return "member";
}

export async function handleCreateUser(form: NewUserForm): Promise<User> {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    password_hash: form.password,
    role: form.role,
  };

  const savedUser = await authService.signup(payload as any);

  return {
    id: savedUser.id,
    name: savedUser.name ?? payload.name,
    email: savedUser.email ?? payload.email,
    role: mapApiRoleToUi((savedUser as any).role),
    initials: getInitials(savedUser.name ?? payload.name),
    avatar_color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
    workload: "available",
    status: (savedUser as any).is_active === false ? "inactive" : "active",
  };
}
