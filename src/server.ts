import app from "./app";
import { AppDataSource } from "./config/database";
import { port } from "./config/config";

AppDataSource.initialize()
  .then(() => {
    console.log("Database connection established");

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error during database initialization:", error);
    process.exit(1);
  });
