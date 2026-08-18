require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express    = require('express');
const cors       = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app  = express();
const PORT = process.env.PORT || 3001;
const URI  = process.env.MONGO_URI;

if (!URI) {
  console.error('❌  MONGO_URI not set in .env');
  process.exit(1);
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' })); // Higher limit for data URLs/images

// ─── DB connection ────────────────────────────────────────────────────────────
let db;

async function connectDb() {
  const client = new MongoClient(URI);
  await client.connect();
  db = client.db('friendship_story');
  console.log('✅  MongoDB connected →', db.databaseName);
}

function getCollection(name) {
  if (!db) throw new Error('DB not ready');
  return db.collection(name);
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ─── Helper: clean mongo _id → id ────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════════
//  TIMELINE EVENTS
// ═══════════════════════════════════════════════════════════════════════════════
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

    // Auto-seed MongoDB if empty
    if (docs.length === 0) {
      console.log('🌱 Seeding timeline_events in MongoDB...');
      const seedDocs = SEED_TIMELINE.map((item) => ({ ...item, createdAt: new Date() }));
      await col.insertMany(seedDocs);
      docs = await col.find({}).sort({ date: 1 }).toArray();
    }

    res.json(docs.map(toClient));
  } catch (e) {
    console.error('[API Error GET /api/timeline]:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/timeline', async (req, res) => {
  try {
    const doc = { ...req.body, createdAt: new Date() };
    const result = await getCollection('timeline_events').insertOne(doc);
    res.status(201).json(toClient({ _id: result.insertedId, ...doc }));
  } catch (e) {
    console.error('[API Error POST /api/timeline]:', e);
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
    console.error('[API Error PUT /api/timeline/:id]:', e);
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/timeline/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await getCollection('timeline_events').deleteOne(makeQuery(id));
    res.json({ ok: true });
  } catch (e) {
    console.error('[API Error DELETE /api/timeline/:id]:', e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  QUIZ QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/quiz', async (_req, res) => {
  try {
    const docs = await getCollection('quiz_questions')
      .find({})
      .sort({ createdAt: 1 })
      .toArray();
    res.json(docs.map(toClient));
  } catch (e) {
    console.error('[API Error GET /api/quiz]:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/quiz', async (req, res) => {
  try {
    const doc = { ...req.body, createdAt: new Date() };
    const result = await getCollection('quiz_questions').insertOne(doc);
    res.status(201).json(toClient({ _id: result.insertedId, ...doc }));
  } catch (e) {
    console.error('[API Error POST /api/quiz]:', e);
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
    console.error('[API Error PUT /api/quiz/:id]:', e);
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/quiz/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await getCollection('quiz_questions').deleteOne(makeQuery(id));
    res.json({ ok: true });
  } catch (e) {
    console.error('[API Error DELETE /api/quiz/:id]:', e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  GUESS PHOTO ROUNDS
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/guess-photo', async (_req, res) => {
  try {
    const docs = await getCollection('guess_photo_rounds')
      .find({})
      .sort({ createdAt: 1 })
      .toArray();
    res.json(docs.map(toClient));
  } catch (e) {
    console.error('[API Error GET /api/guess-photo]:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/guess-photo', async (req, res) => {
  try {
    const doc = { ...req.body, createdAt: new Date() };
    const result = await getCollection('guess_photo_rounds').insertOne(doc);
    res.status(201).json(toClient({ _id: result.insertedId, ...doc }));
  } catch (e) {
    console.error('[API Error POST /api/guess-photo]:', e);
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
    console.error('[API Error PUT /api/guess-photo/:id]:', e);
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/guess-photo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await getCollection('guess_photo_rounds').deleteOne(makeQuery(id));
    res.json({ ok: true });
  } catch (e) {
    console.error('[API Error DELETE /api/guess-photo/:id]:', e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  GAME SCORES / LEADERBOARD
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/scores', async (_req, res) => {
  try {
    const docs = await getCollection('game_scores')
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    res.json(docs.map(toClient));
  } catch (e) {
    console.error('[API Error GET /api/scores]:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/scores', async (req, res) => {
  try {
    const doc = { ...req.body, createdAt: new Date() };
    const result = await getCollection('game_scores').insertOne(doc);
    res.status(201).json(toClient({ _id: result.insertedId, ...doc }));
  } catch (e) {
    console.error('[API Error POST /api/scores]:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
      console.log(`    Quiz API:        GET http://localhost:${PORT}/api/quiz`);
      console.log(`    Guess Photo API: GET http://localhost:${PORT}/api/guess-photo`);
      console.log(`    Scores API:      GET http://localhost:${PORT}/api/scores`);
    });
  })
  .catch((err) => {
    console.error('❌  Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
