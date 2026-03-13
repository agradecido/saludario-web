export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function fromIsoToLocalInput(isoValue: string): string {
  const date = new Date(isoValue);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function fromLocalInputToIso(localValue: string): string {
  return new Date(localValue).toISOString();
}

export function formatTimelineDate(isoValue: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(isoValue));
}

