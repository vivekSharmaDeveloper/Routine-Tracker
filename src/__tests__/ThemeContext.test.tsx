import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'

// Mock console.log to avoid cluttering test output
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, toggleTheme, setTheme } = useTheme()
  
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
    </div>
  )
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock document.documentElement
const mockDocumentElement = {
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    toString: jest.fn(() => 'mocked-classes'),
  },
}

Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
})

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    consoleSpy.mockClear()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  it('should render children with default light theme', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })
  })

  it('should load theme from localStorage on mount', async () => {
    localStorageMock.getItem.mockReturnValue('dark')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme')
  })

  it('should ignore invalid theme from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-theme')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })
  })

  it('should toggle theme from light to dark', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })

    // Toggle theme
    fireEvent.click(screen.getByTestId('toggle-theme'))

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })
  })

  it('should toggle theme from dark to light', async () => {
    localStorageMock.getItem.mockReturnValue('dark')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Wait for initial render with dark theme
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    // Toggle theme
    fireEvent.click(screen.getByTestId('toggle-theme'))

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })
  })

  it('should set theme to light', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByTestId('set-light'))

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })
  })

  it('should set theme to dark', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByTestId('set-dark'))

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })
  })

  it('should apply theme classes to document element', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Wait for initial mount and theme application
    await waitFor(() => {
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('light')
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark')
    })

    // Change to dark theme
    fireEvent.click(screen.getByTestId('set-dark'))

    await waitFor(() => {
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark')
    })
  })

  it('should save theme to localStorage when changed', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Wait for initial mount
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
    })

    // Change theme
    fireEvent.click(screen.getByTestId('set-dark'))

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
    })
  })

  it('should render with min-height and background color before mounting', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test Content</div>
      </ThemeProvider>
    )

    // Check that content is rendered even before mounting
    const child = screen.getByTestId('child')
    expect(child).toBeInTheDocument()
  })

  it('should log theme changes', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Wait for initial mount
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Theme applied:', 'light', 'Classes:', 'mocked-classes')
    })

    // Toggle theme
    fireEvent.click(screen.getByTestId('toggle-theme'))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Toggling theme from', 'light', 'to', 'dark')
      expect(consoleSpy).toHaveBeenCalledWith('Theme applied:', 'dark', 'Classes:', 'mocked-classes')
    })

    // Set theme directly
    fireEvent.click(screen.getByTestId('set-light'))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Setting theme to:', 'light')
    })
  })
})

describe('useTheme hook', () => {
  it('should throw error when used outside ThemeProvider', () => {
    const TestComponentWithoutProvider = () => {
      const { theme } = useTheme()
      return <div>{theme}</div>
    }

    // Mock console.error to prevent error output during test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponentWithoutProvider />)
    }).toThrow('useTheme must be used within a ThemeProvider')

    consoleErrorSpy.mockRestore()
  })
})
