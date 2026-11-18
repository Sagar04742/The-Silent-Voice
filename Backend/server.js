import "dotenv/config";
import dns from "dns";
// Some networks block SRV lookups needed by mongodb+srv:// URIs; use public DNS.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import app from "./src/app.js";
import connectToDb from "./src/config/db.js";

const PORT = process.env.PORT || 3000;

await connectToDb();

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
