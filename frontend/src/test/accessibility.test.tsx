import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';

describe('accessibility', () => {
  it('Button has no accessibility violations', async () => {
    const { container } = render(<Button>Accessible button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('TextInput has no accessibility violations', async () => {
    const { container } = render(
      <TextInput label="Email" name="email" helperText="Enter email" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('TextInput with error has no accessibility violations', async () => {
    const { container } = render(
      <TextInput
        label="Email"
        name="email"
        hasError
        errorMessage="Invalid email address"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
