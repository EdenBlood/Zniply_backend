import server from './server';
import colors from 'colors'
import connectDB from './config/db';

const PORT = +process.env.PORT || 4000;

async function startServer() {
  await connectDB()

  server.listen(PORT, 'localhost', () => {
    console.log(colors.bgGreen.white.bold( "Server Corriendo en el puerto:" + PORT));
  });
}

startServer();