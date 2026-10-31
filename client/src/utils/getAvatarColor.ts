export const getAvatarColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Force to a 6-digit hex color
  const color = (hash & 0x00ffffff).toString(16).padStart(6, "0");
  return color;
};
