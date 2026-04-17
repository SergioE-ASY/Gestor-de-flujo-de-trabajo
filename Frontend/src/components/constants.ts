import type { PriorityCfgEntry, WorkloadCfgEntry, Workload } from "./types";

export const PRIORITY_CFG: Record<string, PriorityCfgEntry> = {
  urgent: { label: "URGENTE",        rootClass: "pri-urgent", dot: true  },
  high:   { label: "ALTA PRIORIDAD", rootClass: "pri-high",   dot: false },
  medium: { label: "MEDIA",          rootClass: "pri-medium", dot: false },
  low:    { label: "BAJA",           rootClass: "pri-low",    dot: false },
  done:   { label: "COMPLETADO",     rootClass: "pri-done",   dot: false },
  new:    { label: "NUEVA SOLICITUD",rootClass: "pri-new",    dot: false },
};

export const WORKLOAD_CFG: Record<Workload, WorkloadCfgEntry> = {
  available: { label: "DISPONIBLE",    color: "#34d399" },
  critical:  { label: "CARGA CRÍTICA", color: "#f87171" },
  busy:      { label: "EN REUNIÓN",    color: "#fbbf24" },
};
