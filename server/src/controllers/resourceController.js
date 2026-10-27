function resourceController(Model, options = {}) {
  function validate(data) {
    if (options.validate === 'farm' && (!String(data.name || '').trim() || Number(data.size) <= 0)) {
      return 'Farm name and a positive size are required.';
    }
    if (options.validate === 'crop' && !String(data.name || '').trim()) {
      return 'Crop name is required.';
    }
    return null;
  }
  return {
    async list(req, res, next) {
      try {
        const filter = options.owner && req.user.role !== 'admin' ? { owner: req.user.id } : {};
        res.json(await Model.find(filter));
      } catch (error) { next(error); }
    },
    async get(req, res, next) {
      try {
        const item = await Model.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Resource not found.' });
        if (options.owner && req.user.role !== 'admin' && String(item.owner) !== String(req.user.id)) return res.status(403).json({ message: 'You do not have access to this resource.' });
        res.json(item);
      } catch (error) { next(error); }
    },
    async create(req, res, next) {
      try {
        const data = { ...req.body };
        const validationError = validate(data);
        if (validationError) return res.status(400).json({ message: validationError });
        if (options.owner) data.owner = req.user.id;
        res.status(201).json(await Model.create(data));
      } catch (error) { next(error); }
    },
    async update(req, res, next) {
      try {
        const existing = await Model.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Resource not found.' });
        if (options.owner && req.user.role !== 'admin' && String(existing.owner) !== String(req.user.id)) return res.status(403).json({ message: 'You do not have access to this resource.' });
        const validationError = validate({ ...existing, ...req.body });
        if (validationError) return res.status(400).json({ message: validationError });
        const item = await Model.update(req.params.id, req.body);
        if (!item) return res.status(404).json({ message: 'Resource not found.' });
        res.json(item);
      } catch (error) { next(error); }
    },
    async remove(req, res, next) {
      try {
        const existing = await Model.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Resource not found.' });
        if (options.owner && req.user.role !== 'admin' && String(existing.owner) !== String(req.user.id)) return res.status(403).json({ message: 'You do not have access to this resource.' });
        if (!await Model.remove(req.params.id)) return res.status(404).json({ message: 'Resource not found.' });
        res.status(204).send();
      } catch (error) { next(error); }
    }
  };
}
module.exports = resourceController;
