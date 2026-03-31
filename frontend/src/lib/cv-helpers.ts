export function getPrimaryTitle(cv: any): string {
  if (cv.work && cv.work.length > 0) {
    const last = cv.work[cv.work.length - 1];
    if (last.jobTitle) return last.jobTitle;
  }
  if (cv.categoryName) return cv.categoryName;
  return 'Professional';
}

export function getSkills(cv: any): string[] {
  if (!cv.skills) return [];
  return cv.skills.slice(0, 3).map((s: any) => s.skill || '').filter(Boolean);
}

export function getLocation(cv: any): string {
  if (cv.address && cv.address.city && cv.address.country) {
    return `${cv.address.city}, ${cv.address.country}`;
  }
  if (cv.address && (cv.address.city || cv.address.country)) {
    return cv.address.city || cv.address.country;
  }
  return 'Location not specified';
}
