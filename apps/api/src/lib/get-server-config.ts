export function getServerConfig() {
  const port = Number.parseInt(process.env.PORT ?? "3001", 10);

  return {
    host: process.env.HOST ?? "0.0.0.0",
    port: Number.isNaN(port) ? 3001 : port,
  };
}
