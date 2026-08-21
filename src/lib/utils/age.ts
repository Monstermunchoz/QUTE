export function isAdult(dateNaissance: string, now = new Date()): boolean {
  const birth = new Date(dateNaissance);

  if (Number.isNaN(birth.getTime())) {
    return false;
  }

  const eighteenthBirthday = new Date(birth);
  eighteenthBirthday.setFullYear(birth.getFullYear() + 18);

  return now >= eighteenthBirthday;
}
