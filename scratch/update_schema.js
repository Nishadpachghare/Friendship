import { MongoClient } from 'mongodb';

const URI = 'mongodb+srv://pachgharenishad05_db_user:lh6Ot9GGKnbFlnvj@cluster0.25awifo.mongodb.net/friendship_story?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(URI);
  await client.connect();
  console.log('✅ Connected to MongoDB Atlas!');
  const db = client.db('friendship_story');
  const col = db.collection('memories');

  const docs = await col.find({}).toArray();
  console.log(`Found ${docs.length} documents in memories collection.`);

  for (const doc of docs) {
    const updates = {
      caption: doc.caption || 'Our special memory',
      date: doc.date || '2026-05-22',
      category: doc.category || 'Special Days',
      image: doc.image || '',
      video: doc.video || '',
      mediaType: doc.mediaType || (doc.video ? 'video' : 'image'),
      thumbnail: doc.thumbnail || doc.image || '',
      addedBy: doc.addedBy || 'Nishad',
      createdAt: doc.createdAt || new Date(),
    };
    await col.updateOne({ _id: doc._id }, { $set: updates });
  }

  const updatedDocs = await col.find({}).toArray();
  console.log('✅ Updated all documents in MongoDB Atlas with complete 9-field schema:');
  console.log(JSON.stringify(updatedDocs, null, 2));

  await client.close();
}

main().catch(console.error);
