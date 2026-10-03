import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

// The frame shared by the login, sign-up and email-link pages
const AuthCard = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-dvh flex-col">
    <header className="mx-auto flex w-full max-w-page items-center justify-between px-4 py-4">
      <Logo />
      <ThemeToggle />
    </header>

    <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-6">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-5 text-center text-sm text-muted">{footer}</p>}
      </div>
    </main>
  </div>
);

export default AuthCard;
