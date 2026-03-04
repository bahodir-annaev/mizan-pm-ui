/**
 * Calculate color for deadline dates based on time remaining
 * Returns red color ONLY for overdue dates (past deadlines)
 */
export function getDeadlineColor(dateString: string | undefined): string {
  // Return default color if dateString is undefined or empty
  if (!dateString) {
    return 'var(--text-tertiary)';
  }

  // Parse the date string (format: "DD Mon YYYY")
  const parseDate = (str: string): Date => {
    const months: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const parts = str.split(' ');
    if (parts.length !== 3) return new Date();
    
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    
    return new Date(year, month, day);
  };

  const deadline = parseDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const daysRemaining = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // ONLY show red if deadline has already passed (overdue)
  if (daysRemaining < 0) {
    return 'var(--status-late)'; // Red for overdue
  }

  // All other dates (today, tomorrow, future) - normal color
  return 'var(--text-tertiary)';
}

/**
 * Get background color for deadline dates
 * Always returns transparent - no backgrounds for clean visual hierarchy
 */
export function getDeadlineBackgroundColor(dateString: string | undefined): string {
  // Always return transparent - no backgrounds for dates
  return 'transparent';
}

/**
 * Get font weight for deadline dates
 * ONLY bold for overdue dates
 */
export function getDeadlineFontWeight(dateString: string | undefined): number {
  // Return normal weight if dateString is undefined or empty
  if (!dateString) {
    return 400;
  }

  const parseDate = (str: string): Date => {
    const months: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const parts = str.split(' ');
    if (parts.length !== 3) return new Date();
    
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    
    return new Date(year, month, day);
  };

  const deadline = parseDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const daysRemaining = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // ONLY bold if deadline has passed (overdue)
  if (daysRemaining < 0) {
    return 600;
  }

  // Normal weight for all other dates
  return 400;
}
