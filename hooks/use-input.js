export function useInput({}) {
  const [value, setValue] = useState(null);
  const [error, setGlobalError] = useState(null);

  return {
    value,
    setValue,
    error,
    setGlobalError,
  };
}
