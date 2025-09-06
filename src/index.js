/*
Task name: User endpoints

Requirements
  1.  We need to create CRUD endpoints
  2.  The entries (users) can just be saved in a noSQL database (Bonus for using Firebase Realtime Database)
  3.  Each user should have the following data entries: 
        id, name, zip code, latitude, longitude, timezone
  4.  When creating a user, allow input for name and zip code.  
      (Fetch the latitude, longitude, and timezone - Documentation: https://openweathermap.org/current) 
  5.  When updating a user, Re-fetch the latitude, longitude, and timezone (if zip code changes)
  6.  Connect to a ReactJS front-end
  * feel free to add add something creative you'd like
*/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./firebase');
const { enrichFromZip } = require('./geolocation');
const { createUserSchema, updateUserSchema } = require('./validation');

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/', (_, res) => res.send('API is ready to work!'));

// List
app.get('/api/users', async (_, res) => {
  const snap = await db.ref('users').get();
  const val = snap.val() || {};
  const list = Object.entries(val).map(([id, u]) => ({ id, ...u })); // ok if u.id already exists
  res.json(list);
});

// Read by id
app.get('/api/users/:id', async (req, res) => {
  const snap = await db.ref(`users/${req.params.id}`).get();
  if (!snap.exists()) return res.status(404).json({ error: 'Not found' });
  res.json({ id: req.params.id, ...snap.val() });
});

// Create (enrich from zip)
app.post('/api/users', async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  try {
    const { name, zip } = parsed.data;
    const { lat, lon, timezone } = await enrichFromZip(zip);

    const ref = db.ref('users').push();
    const user = {
      id: ref.key,
      name,
      zip,
      latitude: lat,
      longitude: lon,
      timezone,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await ref.set(user);
    res.status(201).json(user);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Update
// Re-fetch the latitude, longitude, and timezone (if zip code changes)
app.patch('/api/users/:id', async (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const id = req.params.id;
  const ref = db.ref(`users/${id}`);
  const snap = await ref.get();
  if (!snap.exists()) return res.status(404).json({ error: 'Not found' });

  const current = snap.val();
  let patch = { ...parsed.data };

  if (patch.zip && patch.zip !== current.zip) {
    try {
      const { lat, lon, timezone } = await enrichFromZip(patch.zip);
      patch = { ...patch, latitude: lat, longitude: lon, timezone };
    } catch (err) {
      return res.status(502).json({ error: err.message });
    }
  }

  patch.updatedAt = Date.now();
  await ref.update(patch);
  const updated = (await ref.get()).val();
  res.json({ id, ...updated });
});

// Delete
app.delete('/api/users/:id', async (req, res) => {
  await db.ref(`users/${req.params.id}`).remove();
  res.status(204).send();
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on ${port}`));
