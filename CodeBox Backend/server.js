import { app } from "./src/app.js";
import env from "./src/config/env.js";

const port = env.SERVER_PORT;
app.listen(port || 5000,()=>{
    console.log("server is running at port ",port);
})

