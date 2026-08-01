export const handler = async (event = {}) => {
  const dueReminders = Array.isArray(event.dueReminders) ? event.dueReminders : [];

  const log = dueReminders.map(({ fakeUserId, habitName }) => {
    const message = `would notify ${fakeUserId} about ${habitName}`;
    console.log(message);
    return message;
  });

  return {
    notified: log.length,
    log,
  };
};
