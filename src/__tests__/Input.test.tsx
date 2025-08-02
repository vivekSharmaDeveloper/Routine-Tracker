import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../components/ui/input'

describe('Input Component', () => {
  it('should render with default props', () => {
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-slot', 'input')
    expect(input).toHaveClass('flex', 'h-9', 'w-full', 'rounded-md', 'border')
  })

  it('should handle input changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(input).toHaveValue('test value')
  })

  it('should accept different input types', () => {
    const { rerender } = render(<Input type="email" data-testid="test-input" />)
    let input = screen.getByTestId('test-input')
    expect(input).toHaveAttribute('type', 'email')

    rerender(<Input type="password" data-testid="test-input" />)
    input = screen.getByTestId('test-input')
    expect(input).toHaveAttribute('type', 'password')

    rerender(<Input type="number" data-testid="test-input" />)
    input = screen.getByTestId('test-input')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('should accept custom className', () => {
    render(<Input className="custom-input" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  it('should forward props correctly', () => {
    render(
      <Input 
        id="test-input"
        name="test"
        maxLength={10}
        aria-label="Test input"
      />
    )
    
    const input = screen.getByLabelText('Test input')
    expect(input).toHaveAttribute('id', 'test-input')
    expect(input).toHaveAttribute('name', 'test')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('should handle focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('should have focus-visible styles', () => {
    render(<Input />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50')
  })

  it('should have aria-invalid styles', () => {
    render(<Input aria-invalid />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive')
  })

  it('should handle defaultValue', () => {
    render(<Input defaultValue="default text" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('default text')
  })

  it('should handle controlled input', () => {
    const handleChange = jest.fn()
    const { rerender } = render(<Input value="controlled" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('controlled')
    
    // Rerender with new value
    rerender(<Input value="updated" onChange={handleChange} />)
    expect(input).toHaveValue('updated')
  })
})
