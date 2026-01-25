'use client';

import type { ComponentProps } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

type SubmitButtonProps = ComponentProps<typeof Button> & {
  pendingContent: React.ReactNode;
};

export function SubmitButton({
  children,
  pendingContent,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" disabled={pending}>
      {pending ? pendingContent : children}
    </Button>
  );
}
