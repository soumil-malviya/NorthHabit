import { AccountTrigger } from './account/AccountTrigger';

export function AppChrome() {
  return (
    <header className="app-chrome" aria-label="Application controls">
      <AccountTrigger />
    </header>
  );
}
