'use client';

import { useEffect, useState } from 'react';

export function useGoogleCalendarStatus() {
  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    fetch('/api/auth/config')
      .then((response) => response.json())
      .then((data: { googleConfigured?: boolean }) => {
        if (active) setGoogleConfigured(Boolean(data.googleConfigured));
      })
      .catch(() => {
        if (active) setGoogleConfigured(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    googleConfigured,
    checking: googleConfigured === null,
  };
}
