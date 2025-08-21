import server from "./server";
import colors from "colors";
import connectDB from "./config/db";

const PORT = +process.env.PORT || 4000;

const HOST = process.env.LOCAL === "true" ? "localhost" : "0.0.0.0";

async function startServer() {
  await connectDB();

  server.listen(PORT, HOST, () => {
    console.log(
      colors.bgGreen.white.bold("Server Corriendo en el puerto:" + PORT)
    );
  });
}

startServer();
