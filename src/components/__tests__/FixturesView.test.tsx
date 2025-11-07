import '../../test/setup'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FixturesView from '../FixturesView'
import type { Fixture, Universe } from '@/lib/types'

const setFixturesMock = vi.fn()
const enqueuePatchMock = vi.fn()

vi.mock('@/lib/dmxQueue', () => ({
  setChannel: (...args: unknown[]) => enqueuePatchMock(...args),
}))

const sliderClicks: number[] = []

vi.mock('@/components/ui/slider', () => ({
  Slider: ({
    'data-testid': dataTestId,
    onValueChange,
    value,
  }: {
    'data-testid'?: string
    onValueChange: (values: number[]) => void
    value?: number[]
  }) => (
    <button
      data-testid={dataTestId ?? 'fixture-slider'}
      onClick={() => {
        const next = ((value?.[0] ?? 0) + 25) % 256
        sliderClicks.push(next)
        onValueChange([next])
      }}
    >
      mock-slider
    </button>
  ),
}))

describe('FixturesView', () => {
  beforeEach(() => {
    setFixturesMock.mockReset()
    enqueuePatchMock.mockReset()
    sliderClicks.length = 0
  })

  it('renders empty state when there are no fixtures', () => {
    render(<FixturesView fixtures={[]} setFixtures={setFixturesMock} universes={[]} activeScene={null} />)

    expect(screen.getByText(/sv.tla/i)).toBeInTheDocument()
    expect(setFixturesMock).not.toHaveBeenCalled()
    expect(enqueuePatchMock).not.toHaveBeenCalled()
  })

  it('updates local fixtures and enqueues DMX patch with absolute channel', async () => {
    const user = userEvent.setup()
    const fixtures: Fixture[] = [
      {
        id: 'fx-1',
        name: 'Spot',
        dmxAddress: 10,
        channelCount: 3,
        universeId: 'uni-1',
        fixtureType: 'moving-head',
        channels: [
          { id: 'ch-1', number: 10, name: 'Dimmer', value: 0 },
          { id: 'ch-2', number: 11, name: 'Pan', value: 0 },
          { id: 'ch-3', number: 12, name: 'Tilt', value: 0 },
        ],
      },
    ]
    const universes: Universe[] = [{ id: 'uni-1', name: 'Main', number: 4 }]

    render(
      <FixturesView fixtures={fixtures} setFixtures={setFixturesMock} universes={universes} activeScene={null} />
    )

    const sliderButton = screen.getByTestId('fixture-slider-fx-1-ch-1')
    await user.click(sliderButton)

    expect(setFixturesMock).toHaveBeenCalledTimes(1)
    expect(enqueuePatchMock).toHaveBeenCalledWith(4, 10, sliderClicks[0])
  })
  it('uses absolute channel numbers when slider channel exceeds fixture range', async () => {
    const user = userEvent.setup()
    const fixtures: Fixture[] = [
      {
        id: 'fx-abs',
        name: 'Laser',
        dmxAddress: 5,
        channelCount: 3,
        universeId: 'uni-abs',
        fixtureType: 'generic',
        channels: [{ id: 'ch-abs', number: 300, name: 'Absolute', value: 0 }],
      },
    ]
    const universes: Universe[] = [{ id: 'uni-abs', name: 'Abs', number: 2 }]

    render(
      <FixturesView fixtures={fixtures} setFixtures={setFixturesMock} universes={universes} activeScene={null} />
    )

    await user.click(screen.getByTestId('fixture-slider-fx-abs-ch-abs'))

    expect(enqueuePatchMock).toHaveBeenCalledWith(2, 300, sliderClicks[0])
  })

  it('updates local fixtures even when universe is not resolved', async () => {
    const user = userEvent.setup()
    const fixtures: Fixture[] = [
      {
        id: 'fx-missing',
        name: 'NoUniverse',
        dmxAddress: 1,
        channelCount: 1,
        universeId: 'missing',
        fixtureType: 'generic',
        channels: [{ id: 'ch-missing', number: 1, name: 'Dimmer', value: 0 }],
      },
    ]

    render(
      <FixturesView fixtures={fixtures} setFixtures={setFixturesMock} universes={[]} activeScene={null} />
    )

    await user.click(screen.getByTestId('fixture-slider-fx-missing-ch-missing'))

    expect(setFixturesMock).toHaveBeenCalledTimes(1)
    expect(enqueuePatchMock).not.toHaveBeenCalled()
  })
})
