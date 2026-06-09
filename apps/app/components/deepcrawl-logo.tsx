import { cn } from '@deepcrawl/ui/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import Image from 'next/image';
import Link from 'next/link';

export const DeepcrawlLogoClassNames = 'inline-flex items-center' as const;

const LOGO_SRC = '/squidcrawl-logo.png';
const LOGO_WIDTH = 187;
const LOGO_HEIGHT = 269;
const LOGO_IMG_CLASS = 'h-7 w-auto shrink-0' as const;

function LogoImage({ className }: { className?: string }) {
  return (
    <Image
      alt="Squidcrawl"
      className={cn(LOGO_IMG_CLASS, className)}
      height={LOGO_HEIGHT}
      priority
      src={LOGO_SRC}
      width={LOGO_WIDTH}
    />
  );
}

export function DeepcrawlLogoText({
  className,
  children,
  ...props
}: React.ComponentProps<'span'>) {
  // When custom children are passed (e.g., loading text), render as plain span
  if (children) {
    return (
      <span
        className={cn('font-semibold text-base tracking-tighter', className)}
        {...props}
      >
        {children}
      </span>
    );
  }

  return <LogoImage className={className} />;
}

export interface DeepcrawlLogoLinkProps
  extends Omit<
    React.ComponentProps<typeof Link>,
    'children' | 'className' | 'href'
  > {
  asChild?: false;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface DeepcrawlLogoAsChildProps
  extends Omit<React.ComponentProps<typeof Slot>, 'children' | 'className'> {
  asChild: true;
  className?: string;
  children: React.ReactElement;
}

export type DeepcrawlLogoProps =
  | DeepcrawlLogoLinkProps
  | DeepcrawlLogoAsChildProps;

export function DeepcrawlLogo({ className, ...props }: DeepcrawlLogoProps) {
  if (props.asChild) {
    const { asChild: _asChild, children, ...slotProps } = props;

    return (
      <Slot className={cn(DeepcrawlLogoClassNames, className)} {...slotProps}>
        {children ?? <LogoImage />}
      </Slot>
    );
  }

  const { asChild: _asChild, href = '/', children, ...linkProps } = props;

  return (
    <Link
      className={cn(DeepcrawlLogoClassNames, className)}
      href={href}
      {...linkProps}
    >
      {children ?? <LogoImage />}
    </Link>
  );
}
