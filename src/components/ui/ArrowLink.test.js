import { render, screen } from '@testing-library/react'
import { ArrowLink } from '@/components/ui/ArrowLink'

describe('ArrowLink', () => {
  it('renders a link with the correct text and direction', () => {
    render(<ArrowLink href="/test">Explore</ArrowLink>)
    expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument()
  })

  it('applies the correct color class', () => {
    const { container } = render(
      <ArrowLink href="/test" color="yellow">
        Contact
      </ArrowLink>
    )
    const link = container.querySelector('a')
    expect(link).toHaveClass('text-accent-2')
  })

  it('renders as a span when as prop is "span"', () => {
    const { container } = render(
      <ArrowLink href="/test" as="span">
        Contact
      </ArrowLink>
    )
    expect(container.querySelector('span')).toBeInTheDocument()
    expect(container.querySelector('a')).not.toBeInTheDocument()
  })

  it('includes the direction suffix in the text', () => {
    render(<ArrowLink href="/test">Explore</ArrowLink>)
    expect(screen.getByText(/explore ↗/i)).toBeInTheDocument()
  })

  it('renders custom direction suffix', () => {
    render(
      <ArrowLink href="/test" direction="↓">
        Scroll
      </ArrowLink>
    )
    expect(screen.getByText(/scroll ↓/i)).toBeInTheDocument()
  })

  it('applies custom className prop', () => {
    const { container } = render(
      <ArrowLink href="/test" className="custom-class">
        Link
      </ArrowLink>
    )
    const link = container.querySelector('a')
    expect(link).toHaveClass('custom-class')
  })
})
