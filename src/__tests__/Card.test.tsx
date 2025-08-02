import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from '../components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render with default classes', () => {
      render(<Card>Card content</Card>)
      
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute('data-slot', 'card')
      expect(card).toHaveClass('bg-card', 'text-card-foreground', 'flex', 'flex-col')
    })

    it('should accept custom className', () => {
      render(<Card className="custom-class">Card content</Card>)
      
      const card = screen.getByText('Card content')
      expect(card).toHaveClass('custom-class')
    })

    it('should forward props', () => {
      render(<Card id="test-card">Card content</Card>)
      
      const card = screen.getByText('Card content')
      expect(card).toHaveAttribute('id', 'test-card')
    })
  })

  describe('CardHeader', () => {
    it('should render with default classes', () => {
      render(<CardHeader>Header content</CardHeader>)
      
      const header = screen.getByText('Header content')
      expect(header).toBeInTheDocument()
      expect(header).toHaveAttribute('data-slot', 'card-header')
      expect(header).toHaveClass('grid', 'auto-rows-min')
    })

    it('should accept custom className', () => {
      render(<CardHeader className="custom-header">Header content</CardHeader>)
      
      const header = screen.getByText('Header content')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('should render with default classes', () => {
      render(<CardTitle>Title content</CardTitle>)
      
      const title = screen.getByText('Title content')
      expect(title).toBeInTheDocument()
      expect(title).toHaveAttribute('data-slot', 'card-title')
      expect(title).toHaveClass('leading-none', 'font-semibold')
    })

    it('should accept custom className', () => {
      render(<CardTitle className="custom-title">Title content</CardTitle>)
      
      const title = screen.getByText('Title content')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('should render with default classes', () => {
      render(<CardDescription>Description content</CardDescription>)
      
      const description = screen.getByText('Description content')
      expect(description).toBeInTheDocument()
      expect(description).toHaveAttribute('data-slot', 'card-description')
      expect(description).toHaveClass('text-muted-foreground', 'text-sm')
    })

    it('should accept custom className', () => {
      render(<CardDescription className="custom-desc">Description content</CardDescription>)
      
      const description = screen.getByText('Description content')
      expect(description).toHaveClass('custom-desc')
    })
  })

  describe('CardAction', () => {
    it('should render with default classes', () => {
      render(<CardAction>Action content</CardAction>)
      
      const action = screen.getByText('Action content')
      expect(action).toBeInTheDocument()
      expect(action).toHaveAttribute('data-slot', 'card-action')
      expect(action).toHaveClass('col-start-2', 'row-span-2')
    })

    it('should accept custom className', () => {
      render(<CardAction className="custom-action">Action content</CardAction>)
      
      const action = screen.getByText('Action content')
      expect(action).toHaveClass('custom-action')
    })
  })

  describe('CardContent', () => {
    it('should render with default classes', () => {
      render(<CardContent>Content</CardContent>)
      
      const content = screen.getByText('Content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveAttribute('data-slot', 'card-content')
      expect(content).toHaveClass('px-6')
    })

    it('should accept custom className', () => {
      render(<CardContent className="custom-content">Content</CardContent>)
      
      const content = screen.getByText('Content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('should render with default classes', () => {
      render(<CardFooter>Footer content</CardFooter>)
      
      const footer = screen.getByText('Footer content')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveAttribute('data-slot', 'card-footer')
      expect(footer).toHaveClass('flex', 'items-center', 'px-6')
    })

    it('should accept custom className', () => {
      render(<CardFooter className="custom-footer">Footer content</CardFooter>)
      
      const footer = screen.getByText('Footer content')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('Complete Card Example', () => {
    it('should render a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
            <CardAction>Action</CardAction>
          </CardHeader>
          <CardContent>Main content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Main content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })
})
