export function useInput({}) {
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  return {
    value,
    setValue,
    error,
    setError,
  };
}
