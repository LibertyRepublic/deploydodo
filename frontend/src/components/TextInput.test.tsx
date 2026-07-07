import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextInput } from '@/components/TextInput';

describe('TextInput', () => {
  it('renders label text', () => {
    render(<TextInput label="Email" name="email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders an input element', () => {
    render(<TextInput label="Name" name="name" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays error message when hasError is true', () => {
    render(
      <TextInput label="Email" name="email" hasError errorMessage="Invalid email" />,
    );
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('displays helper text when provided', () => {
    render(
      <TextInput label="Name" name="name" helperText="Enter full name" />,
    );
    expect(screen.getByText('Enter full name')).toBeInTheDocument();
  });

  it('renders suffix element when provided', () => {
    const suffix = <span>Suffix</span>;
    render(<TextInput label="Domain" name="domain" suffix={suffix} />);
    expect(screen.getByText('Suffix')).toBeInTheDocument();
  });

  it('applies error styling when hasError is true', () => {
    render(
      <TextInput label="Email" name="email" hasError errorMessage="Error" />,
    );
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-error');
  });

  it('does not display error message when hasError is false', () => {
    render(
      <TextInput label="Email" name="email" errorMessage="Should not show" />,
    );
    expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
  });

  it('renders disabled input when disabled prop is set', () => {
    render(<TextInput label="Name" name="name" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('forwards the name attribute to input', () => {
    render(<TextInput label="Email" name="user_email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'user_email');
  });

  it('sets input id from label when id is not provided', () => {
    render(<TextInput label="Email Address" name="email" />);
    expect(screen.getByRole('textbox').id).toBe('email-address');
  });

  it('uses provided id over generated id', () => {
    render(<TextInput label="Email Address" name="email" id="custom-id" />);
    expect(screen.getByRole('textbox').id).toBe('custom-id');
  });
});
