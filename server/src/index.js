const express = require('express');
const cors = require('cors');
const commentRoutes = require('./routes/commentRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5010;

app.use(cors());
app.use(express.json());
app.use('/api/comments', commentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 