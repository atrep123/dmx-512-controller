import '../../test/setup'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataManagementView from '../DataManagementView'

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

    await user.click(screen.getByRole('button', { name: /synchronizovat/i }))

    expect(onRefreshShow).toHaveBeenCalledTimes(1)
  })

  it('disables export and import while loading', () => {
    render(<DataManagementView {...baseProps} showLoading={true} />)

    expect(screen.getByRole('button', { name: /exportovat json/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /importovat json/i })).toBeDisabled()
  })

  it('renders alert when showError is provided', () => {
    render(<DataManagementView {...baseProps} showError="Test error" />)

    expect(screen.getByText(/Test error/)).toBeInTheDocument()
  })

  it('shows formatted last exported timestamp', () => {
    const spy = vi.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('fake-date')

    render(<DataManagementView {...baseProps} lastExportedAt="2024-01-01T00:00:00.000Z" />)

    expect(screen.getByText(/fake-date/)).toBeInTheDocument()

    spy.mockRestore()
  })

  it('renders dirty indicator when snapshot is pending', () => {
    render(<DataManagementView {...baseProps} showDirty={true} />)

    expect(screen.getByText(/cekaji na upload/i)).toBeInTheDocument()
  })
})
