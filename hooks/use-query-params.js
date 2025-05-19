import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useQueryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getHandler = (key) => {
    return searchParams.get(key);
  };

  const deleteHandler = (key) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);

    router.replace(`${pathname}/${params.toString() || ""}`);
  };

  return {
    get: getHandler,
    delete: deleteHandler,
  };
}
