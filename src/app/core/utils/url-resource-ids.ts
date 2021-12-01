export function encodeResourceID(object: string): string {
  return encodeURIComponent(encodeURIComponent(object));
}
