const formatValidationIssue = (issue) => {
  if (!issue || typeof issue !== "object") {
    return "Invalid input.";
  }

  const location = Array.isArray(issue.loc)
    ? issue.loc.filter((part) => part !== "body").join(" → ")
    : "";

  if (location && issue.msg) {
    return `${location}: ${issue.msg}`;
  }

  if (issue.msg) {
    return issue.msg;
  }

  return "Invalid input.";
};


export const getApiErrorMessage = (error, fallbackMessage = "Something went wrong.") => {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const firstIssue = detail[0];

    if (typeof firstIssue === "string") {
      return firstIssue;
    }

    return formatValidationIssue(firstIssue);
  }

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (detail && typeof detail === "object" && typeof detail.message === "string") {
    return detail.message;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};