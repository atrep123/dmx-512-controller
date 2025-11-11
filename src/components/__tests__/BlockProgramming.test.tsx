import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlockProgramming from '@/components/BlockProgramming'
import type { EffectBlock } from '@/lib/types'

const TestHarness = ({ initialBlocks = [] }: { initialBlocks?: EffectBlock[] }) => {
  const [blocks, setBlocks] = useState<EffectBlock[]>(initialBlocks)
  return <BlockProgramming blocks={blocks} onBlocksChange={setBlocks} />
}

describe('BlockProgramming UI', () => {
  it('shows placeholder when there are no blocks', () => {
    render(<TestHarness />)
    expect(screen.getByText(/Click blocks from the library/i)).toBeInTheDocument()
  })

  it('allows adding a block from the library and opening its editor', async () => {
    const user = userEvent.setup()
    render(<TestHarness />)

    await user.click(screen.getByTestId('block-library-set-color'))

    expect(screen.getByText(/1 blocks/i)).toBeInTheDocument()

    const [sequenceItem] = screen.getAllByTestId(/block-sequence-/i)
    await user.click(sequenceItem)

    expect(screen.getAllByText(/^Red:/i).length).toBeGreaterThan(0)
  })
})
