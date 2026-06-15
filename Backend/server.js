import 'dotenv/config'
import dns from 'dns'
dns.setServers(["8.8.8.8", "1.1.1.1"])
import app from "./src/app.js";
import connectToDb from './src/config/db.js';

connectToDb()

app.listen(process.env.PORT,()=>{
    console.log(`Server is running at PORT ${300}`);
})