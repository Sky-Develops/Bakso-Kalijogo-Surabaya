import { DiningTable, TableStatus } from "@/types";

export type TableInput = {
  number: number;
  capacity: number;
  status: TableStatus;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Permintaan gagal diproses.");
  }

  return data;
}

export async function fetchTables() {
  const response = await fetch("/api/tables", { cache: "no-store" });
  return readJson<{ tables: DiningTable[] }>(response);
}

export async function createTable(payload: TableInput) {
  const response = await fetch("/api/tables", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readJson<{ table: DiningTable }>(response);
}

export async function updateTable(id: string, payload: Partial<TableInput>) {
  const response = await fetch(`/api/tables/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readJson<{ table: DiningTable }>(response);
}

export async function deleteTable(id: string) {
  const response = await fetch(`/api/tables/${id}`, { method: "DELETE" });
  return readJson<{ ok: true }>(response);
}

export async function regenerateTableQr(id: string) {
  const response = await fetch(`/api/tables/${id}/qr`, { method: "POST" });
  return readJson<{ table: DiningTable }>(response);
}
