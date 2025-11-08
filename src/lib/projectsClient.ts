import type { ProjectMeta, BackupVersion } from '@/lib/types'

type ProjectsResponse = {
  activeId: string
  projects: ProjectMeta[]
}

type BackupsResponse = {
  projectId: string
  versions: BackupVersion[]
}

const jsonHeaders = {
  'content-type': 'application/json',
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  if (!response.ok) {
    const message = await response.text().catch(() => 'Request failed')
    throw new Error(message || `Request failed for ${path}`)
  }
  return (await response.json()) as T
}

export async function fetchProjects(): Promise<ProjectsResponse> {
  return request<ProjectsResponse>('/projects', { method: 'GET' })
}

export async function createProject(payload: {
  name: string
  venue?: string | null
  eventDate?: string | null
  notes?: string | null
  templateId?: string | null
}): Promise<ProjectsResponse> {
  return request<ProjectsResponse>('/projects', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  })
}

export async function updateProject(projectId: string, payload: Partial<ProjectMeta>): Promise<ProjectMeta> {
  return request<ProjectMeta>(`/projects/${projectId}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  })
}

export async function selectProject(projectId: string): Promise<ProjectsResponse> {
  return request<ProjectsResponse>(`/projects/${projectId}/select`, { method: 'POST' })
}

export async function listProjectBackups(projectId: string): Promise<BackupsResponse> {
  return request<BackupsResponse>(`/projects/${projectId}/backups`, { method: 'GET' })
}

export async function createProjectBackup(projectId: string, label?: string | null): Promise<BackupVersion> {
  return request<BackupVersion>(`/projects/${projectId}/backups`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ label: label ?? null }),
  })
}

export async function restoreProjectBackup(projectId: string, versionId: string): Promise<void> {
  await request(`/projects/${projectId}/restore`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ versionId }),
  })
}
