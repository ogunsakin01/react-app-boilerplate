// npm names must be lowercase and URL-safe. Folder names often aren't
// ("My App", "MyApp"), so the package name is derived rather than rejected.
export function toPackageName(folder: string): string {
  return folder
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, '-')
    .replace(/^[._-]+|[-]+$/g, '')
    .replace(/-{2,}/g, '-');
}
