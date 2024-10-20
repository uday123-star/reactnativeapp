export const parseIsoString = (dateString = ''): Date => {
  if (dateString.length === 0) {
    return new Date();
  }
  const date = new Date(dateString);
  if (date.getTime()) {
    return new Date(date.setUTCHours(12,0,0));
  }
  try {
    const dateArray = dateString.split('T');
    let timeWithOffset = 'T12:00:00-00:00';
    if (dateArray[1] && (dateArray[1].includes('-') || dateArray[1].includes('+'))) {
      const timeArray = dateArray[1].includes('-') ? dateArray[1].split('-') : dateArray[1].split('+');
      const timezoneArray = timeArray[1].split('');
      timeWithOffset = `T${timeArray[0]}${dateArray[1].includes('-') ? '-' : '+'}${timezoneArray.splice(0,2).join('')}:${timezoneArray.join('')}`
    }
    return new Date(`${dateArray[0]}${timeWithOffset}`);
  } catch (error) {
    return new Date();
  }
}
