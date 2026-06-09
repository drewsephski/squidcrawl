import { cn } from '@deepcrawl/ui/lib/utils';

export function Banner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        '!border-b-0 !border-none h-2 w-full md:h-6 lg:h-8',
        className,
      )}
    />
  );
}
