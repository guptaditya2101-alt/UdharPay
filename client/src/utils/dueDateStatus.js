export const getDueDateStatus = (dueDate) => {
  if (!dueDate) {
    return {
      status: "not-set",
      label: "Due date not set",
      days: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${dueDate}T00:00:00`);
  due.setHours(0, 0, 0, 0);

  const difference =
    due.getTime() - today.getTime();

  const days = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  if (days < 0) {
    return {
      status: "overdue",
      label: `${Math.abs(days)} day(s) overdue`,
      days,
    };
  }

  if (days === 0) {
    return {
      status: "today",
      label: "Due today",
      days,
    };
  }

  if (days <= 3) {
    return {
      status: "upcoming",
      label: `Due in ${days} day(s)`,
      days,
    };
  }

  return {
    status: "future",
    label: `Due in ${days} days`,
    days,
  };
};