import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Card content</Card>);

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default card styles', () => {
    const { container } = render(<Card>Content</Card>);

    const card = container.firstChild;
    expect(card).toHaveClass('rounded-xl', 'border', 'bg-card', 'shadow');
  });

  it('applies custom className', () => {
    render(<Card className="custom-card" data-testid="card">Content</Card>);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-card');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(<Card ref={ref}>Content</Card>);

    expect(ref).toHaveBeenCalled();
  });

  it('renders as a div element', () => {
    const { container } = render(<Card>Content</Card>);

    expect(container.firstChild?.nodeName).toBe('DIV');
  });
});

describe('CardHeader', () => {
  it('renders children content', () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>
    );

    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('applies default header styles', () => {
    render(
      <Card>
        <CardHeader data-testid="header">Header</CardHeader>
      </Card>
    );

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
  });

  it('applies custom className', () => {
    render(
      <Card>
        <CardHeader className="custom-header" data-testid="header">Header</CardHeader>
      </Card>
    );

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('custom-header');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(
      <Card>
        <CardHeader ref={ref}>Header</CardHeader>
      </Card>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('CardTitle', () => {
  it('renders title content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('applies default title styles', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle data-testid="title">Title</CardTitle>
        </CardHeader>
      </Card>
    );

    const title = screen.getByTestId('title');
    expect(title).toHaveClass('font-semibold', 'leading-none', 'tracking-tight');
  });

  it('applies custom className', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl" data-testid="title">Title</CardTitle>
        </CardHeader>
      </Card>
    );

    const title = screen.getByTestId('title');
    expect(title).toHaveClass('text-2xl');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(
      <Card>
        <CardHeader>
          <CardTitle ref={ref}>Title</CardTitle>
        </CardHeader>
      </Card>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('CardDescription', () => {
  it('renders description content', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>This is a description</CardDescription>
        </CardHeader>
      </Card>
    );

    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('applies default description styles', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription data-testid="description">Description</CardDescription>
        </CardHeader>
      </Card>
    );

    const description = screen.getByTestId('description');
    expect(description).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('applies custom className', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription className="italic" data-testid="description">Description</CardDescription>
        </CardHeader>
      </Card>
    );

    const description = screen.getByTestId('description');
    expect(description).toHaveClass('italic');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(
      <Card>
        <CardHeader>
          <CardDescription ref={ref}>Description</CardDescription>
        </CardHeader>
      </Card>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('CardContent', () => {
  it('renders content', () => {
    render(
      <Card>
        <CardContent>Main content</CardContent>
      </Card>
    );

    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('applies default content styles', () => {
    render(
      <Card>
        <CardContent data-testid="content">Content</CardContent>
      </Card>
    );

    const content = screen.getByTestId('content');
    expect(content).toHaveClass('p-6', 'pt-0');
  });

  it('applies custom className', () => {
    render(
      <Card>
        <CardContent className="custom-content" data-testid="content">Content</CardContent>
      </Card>
    );

    const content = screen.getByTestId('content');
    expect(content).toHaveClass('custom-content');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(
      <Card>
        <CardContent ref={ref}>Content</CardContent>
      </Card>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('CardFooter', () => {
  it('renders footer content', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies default footer styles', () => {
    render(
      <Card>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    );

    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
  });

  it('applies custom className', () => {
    render(
      <Card>
        <CardFooter className="justify-end" data-testid="footer">Footer</CardFooter>
      </Card>
    );

    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('justify-end');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(
      <Card>
        <CardFooter ref={ref}>Footer</CardFooter>
      </Card>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('Card composition', () => {
  it('renders a complete card with all components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
          <CardDescription>A fully composed card example</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content of the card.</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Complete Card')).toBeInTheDocument();
    expect(screen.getByText('A fully composed card example')).toBeInTheDocument();
    expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('works with partial composition', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Partial Card</CardTitle>
        </CardHeader>
        <CardContent>Content only</CardContent>
      </Card>
    );

    expect(screen.getByText('Partial Card')).toBeInTheDocument();
    expect(screen.getByText('Content only')).toBeInTheDocument();
  });

  it('can be used with custom HTML attributes', () => {
    render(
      <Card data-testid="custom-card">
        <CardHeader data-testid="custom-header">
          <CardTitle>Test</CardTitle>
        </CardHeader>
      </Card>
    );

    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
  });
});
