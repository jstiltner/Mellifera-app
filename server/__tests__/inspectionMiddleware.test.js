const mongoose = require('mongoose');
const Hive = require('../models/Hive');
const Inspection = require('../models/Inspection');

describe('Inspection Middleware Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/test_mellifera_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Hive.deleteMany({});
    await Inspection.deleteMany({});
  });

  test("Creating a new inspection updates the hive's most recent inspection", async () => {
    const hive = await Hive.create({ name: 'Test Hive' });
    const inspection = await Inspection.create({
      hive: hive._id,
      date: new Date(),
      notes: 'Test inspection',
    });

    const updatedHive = await Hive.findById(hive._id);
    expect(updatedHive.mostRecentInspection.toString()).toBe(inspection._id.toString());
    expect(updatedHive.lastInspection).toEqual(inspection.date);
  });

  test("Updating an inspection updates the hive's most recent inspection", async () => {
    const hive = await Hive.create({ name: 'Test Hive' });
    const inspection = await Inspection.create({
      hive: hive._id,
      date: new Date(),
      notes: 'Test inspection',
    });

    const newDate = new Date(inspection.date.getTime() + 86400000); // Add one day
    await Inspection.findByIdAndUpdate(inspection._id, { date: newDate });

    const updatedHive = await Hive.findById(hive._id);
    expect(updatedHive.mostRecentInspection.toString()).toBe(inspection._id.toString());
    expect(updatedHive.lastInspection).toEqual(newDate);
  });
});
