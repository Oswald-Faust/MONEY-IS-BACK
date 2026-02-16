import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI non trouvée dans .env.local');
  process.exit(1);
}

// Minimal Schema to avoid importing the whole model file which might have TS/paths issues
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: String,
  preferences: {
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'fr' }
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB');

    const adminEmail = 'admin@moneyisback.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('L\'admin existe déjà. Mise à jour vers le rôle admin...');
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Succès !');
    } else {
      const hashedPassword = await bcrypt.hash('AdminPassword123!', 12);
      const newAdmin = new User({
        firstName: 'Super',
        lastName: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'fr'
        }
      });

      await newAdmin.save();
      console.log('Admin créé avec succès !');
      console.log('Email: admin@moneyisback.com');
      console.log('Password: AdminPassword123!');
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
