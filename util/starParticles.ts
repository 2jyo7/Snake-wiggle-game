const STAR_PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * 360;
  const radius = 120 + ((i * 37) % 180);
  return {
    x: Math.cos((angle * Math.PI) / 180) * radius,
    y: Math.sin((angle * Math.PI) / 180) * radius,
    scale: 0.6 + ((i * 13) % 8) / 10,
  };
});


export default STAR_PARTICLES;