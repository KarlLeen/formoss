import { createServer } from "node:http";
import { dispatch, MAX_BODY_BYTES } from "./app.js";

const PORT = Number(process.env.PORT ?? 5173);

const server = createServer((req, res) => {
  void dispatch(req, res);
});

server.listen(PORT, () => {
  console.log(`Sealmoss web on http://localhost:${PORT}`);
  console.log(
    `POST /api/run (max body ${MAX_BODY_BYTES} bytes); fixture-only unless SEALMOSS_WEB_ALLOW_LIVE=1 + live:true`,
  );
});
