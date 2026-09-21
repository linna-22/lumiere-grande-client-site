const TECHNICAL_ERROR_PATTERN =
  /SQLSTATE|Integrity constraint|Duplicate entry|Connection:|Exception|Undefined|TypeError|stack trace|at .+\.php|<html/i;

export function getFriendlyError(error) {
  const raw =
    typeof error === "string" ? error : error?.message || String(error || "");

  // Keep the real error for developers
  console.error("[App error]", error);

  if (/Duplicate entry|SQLSTATE/i.test(raw)) {
    return "We couldn't complete your request right now. Please try again in a moment.";
  }

  if (/Network Error|Failed to fetch|timeout|ECONN/i.test(raw)) {
    return "We couldn't reach our server. Please check your internet connection and try again.";
  }

  if (TECHNICAL_ERROR_PATTERN.test(raw) || raw.length > 180) {
    return "Something went wrong while processing your request. Please try again, or contact our team if the problem continues.";
  }

  return raw || "Something went wrong. Please try again.";
}