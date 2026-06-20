export default function methodBadge(method: string) {
  const map: Record<string, string> = {
    GET: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    POST: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    PUT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    PATCH:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return map[method] || "bg-gray-100";
}