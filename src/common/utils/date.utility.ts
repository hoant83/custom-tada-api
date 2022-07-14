export const addDays = (milestone: Date, days: number): Date => {
  return new Date(
    milestone.getFullYear(),
    milestone.getMonth(),
    milestone.getDate() + days,
    milestone.getHours(),
    milestone.getMinutes(),
    milestone.getSeconds(),
  );
};

export const addDaysFromNow = (days: number): Date => {
  return addDays(new Date(), days);
};
