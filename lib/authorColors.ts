export function getAuthorColor(authorUid: string): string {
  const palette = [
    "bg-blue-700 text-white border-blue-400",
    "bg-emerald-700 text-white border-emerald-400",
    "bg-purple-700 text-white border-purple-400",
    "bg-amber-700 text-white border-amber-300",
    "bg-rose-700 text-white border-rose-300",
    "bg-cyan-700 text-white border-cyan-300",
  ];

  let hash = 0;
  for (let i = 0; i < authorUid.length; i++) {
    hash = (hash + authorUid.charCodeAt(i)) % palette.length;
  }

  return palette[hash];
}