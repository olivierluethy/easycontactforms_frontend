// Returns a value that only settles once the input has stopped changing.
//
// Used for the project search box and for the live favicon preview, which
// would otherwise fire a request on every keystroke.

import { useEffect, useState } from 'react';

export function useDebouncedValue(value, delay = 300) {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return settled;
}
