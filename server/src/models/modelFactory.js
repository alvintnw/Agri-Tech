const { getCollection, id, now } = require('../config/store');

function clean(doc, hideSecrets = true) {
  if (!doc) return doc;
  const value = { ...doc };
  if (value._id) value.id = String(value._id);
  delete value.__v;
  if (hideSecrets) delete value.password;
  return value;
}

function memoryModel(collection) {
  return {
    async find(filter = {}) {
      return getCollection(collection).filter(item => Object.entries(filter).every(([key, value]) => String(item[key]) === String(value))).map(clean);
    },
    async findOne(filter = {}) {
      return (await this.find(filter))[0] || null;
    },
    async findById(value) {
      const item = getCollection(collection).find(row => String(row._id) === String(value) || String(row.id) === String(value));
      return clean(item);
    },
    async create(data) {
      const item = { _id: id(), ...data, createdAt: now(), updatedAt: now() };
      getCollection(collection).push(item);
      return clean(item);
    },
    async update(value, data) {
      const item = getCollection(collection).find(row => String(row._id) === String(value) || String(row.id) === String(value));
      if (!item) return null;
      Object.assign(item, data, { updatedAt: now() });
      return clean(item);
    },
    async remove(value) {
      const items = getCollection(collection);
      const index = items.findIndex(row => String(row._id) === String(value) || String(row.id) === String(value));
      if (index < 0) return false;
      items.splice(index, 1);
      return true;
    },
    async count(filter = {}) { return (await this.find(filter)).length; }
  };
}

function createModel(collection, mongooseModel) {
  let useMongo = false;
  const api = {
    useMongo(value) { useMongo = value; },
    async find(filter) {
      return useMongo ? (await mongooseModel.find(filter).lean()).map(clean) : memoryModel(collection).find(filter);
    },
    async findOne(filter) {
      return useMongo ? clean(await mongooseModel.findOne(filter).lean()) : memoryModel(collection).findOne(filter);
    },
    async findOneRaw(filter) {
      return useMongo ? clean(await mongooseModel.findOne(filter).lean(), false) : getCollection(collection).find(item => Object.entries(filter).every(([key, value]) => String(item[key]) === String(value))) || null;
    },
    async findById(value) {
      return useMongo ? clean(await mongooseModel.findById(value).lean()) : memoryModel(collection).findById(value);
    },
    async create(data) {
      return useMongo ? clean((await mongooseModel.create(data)).toObject()) : memoryModel(collection).create(data);
    },
    async update(value, data) {
      return useMongo ? clean(await mongooseModel.findByIdAndUpdate(value, data, { new: true }).lean()) : memoryModel(collection).update(value, data);
    },
    async remove(value) {
      if (useMongo) return Boolean(await mongooseModel.findByIdAndDelete(value));
      return memoryModel(collection).remove(value);
    },
    async count(filter) { return useMongo ? mongooseModel.countDocuments(filter) : memoryModel(collection).count(filter); }
  };
  return api;
}

module.exports = { createModel };
