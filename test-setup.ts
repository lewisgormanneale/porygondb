const originalConsoleWarn = console.warn.bind(console);

console.warn = (...args: unknown[]) => {
  const firstArg = args[0];
  const message = typeof firstArg === 'string' ? firstArg : '';

  if (message.includes('NG02956')) {
    return;
  }

  originalConsoleWarn(...args);
};
