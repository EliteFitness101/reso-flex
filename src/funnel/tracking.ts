export function track(
  event: string,
  payload?: Record<string, unknown>
) {
  console.log("TRACK", event, payload);
}
