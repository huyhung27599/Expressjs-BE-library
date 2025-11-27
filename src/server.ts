import app from "./app";
import { AppDataSource } from "./config/database";
import { port } from "./config/config";

const PORT = port || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connection established");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during database initialization:", error);
    process.exit(1);
  });
