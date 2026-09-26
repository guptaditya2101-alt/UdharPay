export const formatDate = (date) => {
  if (!date) {
    return "Not set";
  }

  const formattedDate = new Date(date);

  if (Number.isNaN(formattedDate.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(formattedDate);
};