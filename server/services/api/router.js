import healthRouter from "./routes/index.js";
import reportsRouter from "./routes/reports.js";

export const router = () => {
  const routes = [
    {
      proxy: "api",
      routes: [...healthRouter, ...reportsRouter],
    },
  ];

  return routes;
};
