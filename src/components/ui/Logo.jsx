import React, { useEffect, useState } from 'react';

function Logo({ className = '', style = {}, size = 40, ...props }) {
  const [logo, setLogo] = useState({ light: '', dark: '' });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    setLogo({
      light: settings.logoLight || '',
      dark: settings.logoDark || '',
    });
    const match = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(match.matches);
    const handler = (e) => setIsDark(e.matches);
    match.addEventListener('change', handler);
    return () => match.removeEventListener('change', handler);
  }, []);

  const src = isDark ? logo.dark : logo.light;
  if (!src) {
    return null;
  }
  return (
    <img
      src={src}
      alt="Logo Website"
      className={`object-contain ${className}`}
      style={{ height: size, maxHeight: size, ...style }}
      height={size}
      {...props}
    />
  );
}

export default Logo;
