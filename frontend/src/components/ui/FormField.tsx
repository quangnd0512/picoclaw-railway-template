import { Children, cloneElement, isValidElement, useId, type ReactElement } from 'react';

export interface FormFieldProps {
  label: string;
  id?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: ReactElement;
}

export function FormField({ label, id, error, helpText, required, children }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  const describedBy = [
    error ? errorId : null,
    helpText ? helpId : null,
  ].filter(Boolean).join(' ') || undefined;

  const child = Children.only(children);
  const clonedChild = isValidElement(child)
    ? cloneElement(child, {
        id: fieldId,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': describedBy,
      } as React.HTMLAttributes<HTMLInputElement>)
    : child;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      {clonedChild}
      {helpText && (
        <p id={helpId} className="text-xs text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
