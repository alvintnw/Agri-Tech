const { Discussion } = require('../models/schemas');

async function list(req, res, next) {
  try { res.json(await Discussion.find({})); } catch (error) { next(error); }
}

async function create(req, res, next) {
  try {
    const title = String(req.body.title || '').trim();
    const body = String(req.body.body || '').trim();
    if (!title || !body) return res.status(400).json({ message: 'A discussion title and message are required.' });
    if (title.length > 140 || body.length > 2000) return res.status(400).json({ message: 'Discussion content is too long.' });
    res.status(201).json(await Discussion.create({ title, body, authorId: req.user.id, authorName: req.user.name, replies: 0 }));
  } catch (error) { next(error); }
}

module.exports = { list, create };
