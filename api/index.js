import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const URI = process.env.MONGO_URI || 'mongodb+srv://pachgharenishad05_db_user:lh6Ot9GGKnbFlnvj@cluster0.25awifo.mongodb.net/?appName=Cluster0';

app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));

// ── Health check (NO DB DEPENDENCY FOR INSTANT 200 OK) ────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

let db;
async function getDb() {
  if (db) return db;
  const client = new MongoClient(URI, {
    connectTimeoutMS: 8000,
    serverSelectionTimeoutMS: 8000,
  });
  await client.connect();
  db = client.db('friendship_story');
  console.log('✅ MongoDB connected in Vercel serverless handler →', db.databaseName);
  return db;
}

app.use(async (_req, _res, next) => {
  try {
    await getDb();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    next(err);
  }
});

function getCollection(name) {
  if (!db) throw new Error('DB not ready');
  return db.collection(name);
}

function toClient(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: doc.id || _id.toString(), ...rest };
}

function makeQuery(id) {
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { id: id }] };
  }
  return { id: id };
}

// ── Timeline ──
const SEED_TIMELINE = [
  { title: 'First Sorry', emoji: '🥺', date: '2026-07-14', text: 'I knew I was wrong, so I made you a little coding website to say sorry. I\'ve never had an ego with you; losing you matters more.' },
  { title: 'First Chat', emoji: '💬', date: '2025-09-20', text: 'It all started with one random mention about a BMW drift, and somehow that one little moment turned into a journey this thrilling.' },
  { title: 'First Meet', emoji: '✨', date: '2026-05-22', text: 'I was so nervous when I first met you, but somehow that nervous day turned into memories we\'re still making together.' },
  { title: 'First Hangout', emoji: '☕', date: '2026-05-22', text: 'My first and favourite hangout singing our hearts out, enjoying every little moment, and somehow making memories we\'re still making today.' },
  { title: 'Best Memory (so far)', emoji: '❤️', date: '2026-05-22', text: 'For me, every memory with you is a best memory and there is no so far about it. It is infinity.' },
  { title: 'First Photo', emoji: '📸', date: '2026-07-03', text: 'Our first photo was actually from our second meet both in our Brazil T-shirts, capturing a moment that somehow became one of my favourite pictures of us.' },
  { title: 'First Fight', emoji: '😭', date: '2026-08-03', text: 'I still remember that day, and I know I was wrong. I\'m truly sorry, yaar. Both our fights taught me a lot not just about my mistakes, but about how much this friendship really means to me.' },
];

app.get('/api/timeline', async (_req, res) => {
  try {
    const col = getCollection('timeline_events');
    let docs = await col.find({}).sort({ date: 1 }).toArray();
    if (docs.length === 0) {
      const seedDocs = SEED_TIMELINE.map((item) => ({ ...item, createdAt: new Date() }));
      await col.insertMany(seedDocs);
      docs = await col.find({}).sort({ date: 1 }).toArray();
    }
    res.json(docs.map(toClient));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/timeline', async (req, res) => {
  try {
    const doc = { ...req.body, createdAt: new Date() };
    const result = await getCollection('timeline_events').insertOne(doc);
    res.status(201).json(toClient({ _id: result.insertedId, ...doc }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/timeline/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, id: _fId, ...updates } = req.body;
    const result = await getCollection('timeline_events').findOneAndUpdate(
      makeQuery(id),
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(toClient(result));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/timeline/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await getCollection('timeline_events').deleteOne(makeQuery(id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Quiz ──
app.get('/api/quiz', async (_req, res) => {
  try {
    const docs = await getCollection('quiz_questions').find({}).sort({ createdAt: 1 }).toArray();
    res.json(docs.map(toClient));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/quiz', async (req, res) => {
  try {
    const doc = { ...req.body, createdAt: new Date() };
    const result = await getCollection('quiz_questions').insertOne(doc);
    res.status(201).json(toClient({ _id: result.insertedId, ...doc }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/quiz/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, id: _fId, ...updates } = req.body;
    const result = await getCollection('quiz_questions').findOneAndUpdate(
      makeQuery(id),
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(toClient(result));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/quiz/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await getCollection('quiz_questions').deleteOne(makeQuery(id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Guess Photo ──
app.get('/api/guess-photo', async (_req, res) => {
  try {
    const docs = await getCollection('guess_photo_rounds').find({}).sort({ createdAt: 1 }).toArray();
    res.json(docs.map(toClient));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/guess-photo', async (req, res) => {
  try {
    const doc = { ...req.body, createdAt: new Date() };
    const result = await getCollection('guess_photo_rounds').insertOne(doc);
    res.status(201).json(toClient({ _id: result.insertedId, ...doc }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/guess-photo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, id: _fId, ...updates } = req.body;
    const result = await getCollection('guess_photo_rounds').findOneAndUpdate(
      makeQuery(id),
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(toClient(result));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/guess-photo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await getCollection('guess_photo_rounds').deleteOne(makeQuery(id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Scores ──
app.get('/api/scores', async (_req, res) => {
  try {
    const docs = await getCollection('game_scores').find({}).sort({ createdAt: -1 }).limit(50).toArray();
    res.json(docs.map(toClient));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/scores', async (req, res) => {
  try {
    const doc = { ...req.body, createdAt: new Date() };
    const result = await getCollection('game_scores').insertOne(doc);
    res.status(201).json(toClient({ _id: result.insertedId, ...doc }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default app;
