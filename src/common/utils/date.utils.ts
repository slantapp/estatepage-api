export function calculateDueDate(
  billingCycle:string,
  serviceCreatedAt: Date,
  currentDate: Date = new Date()
): Date {
  const created = new Date(serviceCreatedAt);
  let dueDate = new Date(created);

  switch (billingCycle) {
    case 'monthly':
      while (dueDate <= currentDate) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      break;
    case 'quarterly':
      while (dueDate <= currentDate) {
        dueDate.setMonth(dueDate.getMonth() + 3);
      }
      break;
    case 'annually':
      while (dueDate <= currentDate) {
        dueDate.setFullYear(dueDate.getFullYear() + 1);
      }
      break;
    case 'onetime':
      // For one-time, due date is just the created date
      return created;
    default:
      return created;
  }
  return dueDate;
}
