const app = require("./app");
require("dotenv").config();
require("./config/db"); // connect DB

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});