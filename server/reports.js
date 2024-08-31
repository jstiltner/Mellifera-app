const Apiary = require('./models/Apiary');
const Hive = require('./models/Hive');
const Inspection = require('./models/Inspection');

const getReportData = async () => {
  try {
    const apiaryCount = await Apiary.countDocuments();
    const hiveCount = await Hive.countDocuments();
    const inspectionCount = await Inspection.countDocuments();

    const hivesByApiary = await Hive.aggregate([
      { $group: { _id: '$apiary', count: { $sum: 1 } } },
    ]);

    const inspectionsByMonth = await Inspection.aggregate([
      {
        $group: {
          _id: { $month: '$date' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const honeyProduction = await Inspection.aggregate([
      {
        $group: {
          _id: null,
          totalHoney: { $sum: '$honeyProduction' },
          avgHoney: { $avg: '$honeyProduction' },
        },
      },
    ]);

    return {
      apiaryCount,
      hiveCount,
      inspectionCount,
      hivesByApiary,
      inspectionsByMonth,
      honeyProduction: honeyProduction[0] || { totalHoney: 0, avgHoney: 0 },
    };
  } catch (error) {
    console.error('Error generating report data:', error);
    throw error;
  }
};

module.exports = { getReportData };
