import app from './app';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
