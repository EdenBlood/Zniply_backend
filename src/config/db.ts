import mongoose from "mongoose";
import colors from "colors";
import { exit } from 'node:process'

async function connectDB() {
  console.log(colors.bgCyan.white.bold('Conectando a la base de datos...'))
  try {
    const { connection } = await mongoose.connect(process.env.DATABASE_URL)

    const url = `${connection.host}:${connection.port}/${connection.name}`;

    console.log(colors.bgYellow.white.bold(`Conexión exitosa a la base de datos: ${url}`));
  } catch (error) {
    console.error(colors.bgRed.black.bold("Error al conectar a la base de datos:" + error));
    exit(1);
  }
}

export default connectDB;