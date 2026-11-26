export const isSameDay = (dateString1: string, dateString2: string) => {
  return (
    new Date(dateString1).toDateString() ===
    new Date(dateString2).toDateString()
  );
};

export const formatDateTag = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return "Today";
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};
