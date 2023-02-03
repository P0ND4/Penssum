export const adminParticles = {
  fpsLimit: 120,
  particles: {
    color: { value: "#ffffff" },
    collisions: { enable: true },
    move: {
      direction: "none",
      enable: true,
      outMode: "bounce",
      random: true,
      speed: 0.8,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 100,
    },
    opacity: { value: 0.5 },
    shape: { type: "circle" },
    size: {
      random: true,
      value: 6,
    },
  },
  detectRetina: true,
}