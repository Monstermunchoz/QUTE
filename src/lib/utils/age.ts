export function getAge(dateNaissance: string | null | undefined): number | null {
  if (!dateNaissance) {
    return null;
  }

  const birth = new Date(dateNaissance);

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function formatBirthDate(dateNaissance: string | null | undefined) {
  if (!dateNaissance) {
    return null;
  }

  const birth = new Date(dateNaissance);

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  return birth.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function isAdult(dateNaissance: string, now = new Date()): boolean {
  const birth = new Date(dateNaissance);

  if (Number.isNaN(birth.getTime())) {
    return false;
  }

  const eighteenthBirthday = new Date(birth);
  eighteenthBirthday.setFullYear(birth.getFullYear() + 18);

  return now >= eighteenthBirthday;
}
