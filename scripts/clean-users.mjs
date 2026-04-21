import mongoose from 'mongoose';
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

async function cleanUsers() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connecté à MongoDB');
  const db = mongoose.connection.db;

  // Vérifier que l'admin existe
  const admin = await db.collection('users').findOne({ email: 'admin@moneyisback.com' });
  if (!admin) {
    console.error('Admin introuvable — abandon.');
    await mongoose.disconnect();
    process.exit(1);
  }

  // Tous les workspaces (y compris orphelins)
  const allWorkspaces = await db.collection('workspaces').find({}, { projection: { _id: 1 } }).toArray();
  const workspaceIds = allWorkspaces.map(w => w._id);
  console.log(`Workspaces à supprimer : ${workspaceIds.length}`);

  // Tous les projets
  const allProjects = await db.collection('projects').find({}, { projection: { _id: 1 } }).toArray();
  const projectIds = allProjects.map(p => p._id);
  console.log(`Projets à supprimer : ${projectIds.length}`);

  // Suppression en cascade (tout vider, pas seulement par owner)
  const steps = [
    { col: 'tasks',                  filter: { project: { $in: projectIds } } },
    { col: 'routines',               filter: { project: { $in: projectIds } } },
    { col: 'objectives',             filter: { workspace: { $in: workspaceIds } } },
    { col: 'ideas',                  filter: { workspace: { $in: workspaceIds } } },
    { col: 'drivefiles',             filter: { project: { $in: projectIds } } },
    { col: 'drivefolders',           filter: { project: { $in: projectIds } } },
    { col: 'secureids',              filter: {} },
    { col: 'messages',               filter: {} },
    { col: 'conversations',          filter: { workspace: { $in: workspaceIds } } },
    { col: 'invitations',            filter: { workspace: { $in: workspaceIds } } },
    { col: 'aiconversations',        filter: { workspace: { $in: workspaceIds } } },
    { col: 'whatsapplinks',          filter: { workspace: { $in: workspaceIds } } },
    { col: 'whatsapppendingactions', filter: { workspace: { $in: workspaceIds } } },
    { col: 'projects',               filter: {} },
    { col: 'workspaces',             filter: {} },
    { col: 'users',                  filter: { email: { $ne: 'admin@moneyisback.com' } } },
  ];

  for (const { col, filter } of steps) {
    const res = await db.collection(col).deleteMany(filter);
    if (res.deletedCount > 0) console.log(`  ✓ ${col}: ${res.deletedCount} supprimé(s)`);
  }

  const usersLeft = await db.collection('users').countDocuments();
  const wsLeft    = await db.collection('workspaces').countDocuments();
  const prjLeft   = await db.collection('projects').countDocuments();
  console.log(`\n✅ Terminé — users: ${usersLeft}, workspaces: ${wsLeft}, projets: ${prjLeft}`);

  await mongoose.disconnect();
  process.exit(0);
}

cleanUsers().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
