import '../../test/setup'
import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataManagementView from '../DataManagementView'
import { useState } from 'react'

vi.mock('@github/spark/hooks', () => ({
  useKV: <T,>(key: string, initial: T) => useState(initial),
}))

vi.mock('@/lib/projectsClient', () => {
  const now = Date.now()
  const defaultProject = {
    id: 'default',
    name: 'Default',
    venue: null,
    eventDate: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
    lastBackupAt: null,
  }
  return {
    fetchProjects: vi.fn().mockResolvedValue({ activeId: defaultProject.id, projects: [defaultProject] }),
    createProject: vi.fn().mockResolvedValue({ activeId: defaultProject.id, projects: [defaultProject] }),
    selectProject: vi.fn().mockResolvedValue({ activeId: defaultProject.id, projects: [defaultProject] }),
    updateProject: vi.fn().mockResolvedValue(defaultProject),
    listProjectBackups: vi.fn().mockResolvedValue({ projectId: defaultProject.id, versions: [] }),
    createProjectBackup: vi.fn().mockResolvedValue({
      versionId: 'v1',
      createdAt: now,
      size: 1024,
      label: 'test',
      provider: 'local',
      encrypted: false,
    }),
    restoreProjectBackup: vi.fn().mockResolvedValue(undefined),
  }
})

const noopSetter = () => {}

const baseProps = {
  universes: [],
  fixtures: [],
  scenes: [],
  effects: [],
  stepperMotors: [],
  servos: [],
  showLoading: false,
  showError: null,
  showDirty: false,
  setUniverses: noopSetter,
  setFixtures: noopSetter,
  setScenes: noopSetter,
  setEffects: noopSetter,
  setStepperMotors: noopSetter,
  setServos: noopSetter,
}

describe('DataManagementView', () => {
  it('calls onRefreshShow when Synchronizovat is clicked', async () => {
    const user = userEvent.setup()
    const onRefreshShow = vi.fn().mockResolvedValue(true)

    render(<DataManagementView {...baseProps} onRefreshShow={onRefreshShow} />)
    await screen.findByRole('heading', { name: /projekty/i })

    await user.click(screen.getByRole('button', { name: /synchronizovat/i }))

    expect(onRefreshShow).toHaveBeenCalledTimes(1)
  })

  it('disables export and import while loading', async () => {
    render(<DataManagementView {...baseProps} showLoading={true} />)
    await screen.findByRole('heading', { name: /projekty/i })
    expect(screen.getByRole('button', { name: /exportovat json/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /importovat json/i })).toBeDisabled()
  })

  it('renders alert when showError is provided', async () => {
    render(<DataManagementView {...baseProps} showError="Test error" />)
    await screen.findByRole('heading', { name: /projekty/i })
    expect(screen.getByText(/Test error/)).toBeInTheDocument()
  })

  it('shows formatted last exported timestamp', async () => {
    const spy = vi.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('fake-date')

    render(<DataManagementView {...baseProps} lastExportedAt="2024-01-01T00:00:00.000Z" />)
    await screen.findByRole('heading', { name: /projekty/i })

    expect(screen.getByText(/fake-date/)).toBeInTheDocument()

    spy.mockRestore()
  })

  it('renders dirty indicator when snapshot is pending', async () => {
    render(<DataManagementView {...baseProps} showDirty={true} />)
    await screen.findByRole('heading', { name: /projekty/i })
    expect(screen.getByText(/cekaji na upload/i)).toBeInTheDocument()
  })
})
