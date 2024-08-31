import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Reports = () => {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get('/api/reports');
        setReportData(response.data);
      } catch (error) {
        console.error('Error fetching report data:', error);
        // Use dummy data if the server request fails
        setReportData(dummyData);
      }
    };

    // Set a timeout to use dummy data if the server doesn't respond in 5 seconds
    const timeoutId = setTimeout(() => {
      if (!reportData) {
        console.log('Server response timed out. Using dummy data.');
        setReportData(dummyData);
      }
    }, 5000);

    fetchReportData();

    // Clear the timeout if the component unmounts or the effect runs again
    return () => clearTimeout(timeoutId);
  }, []);

  // Dummy data for the demo
  const dummyData = {
    apiaryCount: 5,
    hiveCount: 25,
    inspectionCount: 150,
    honeyProduction: {
      totalHoney: 750.5,
      avgHoney: 30.02,
    },
    hivesByApiary: [
      { _id: 'Apiary 1', count: 6 },
      { _id: 'Apiary 2', count: 8 },
      { _id: 'Apiary 3', count: 4 },
      { _id: 'Apiary 4', count: 3 },
      { _id: 'Apiary 5', count: 4 },
    ],
    inspectionsByMonth: [
      { _id: 1, count: 10 },
      { _id: 2, count: 15 },
      { _id: 3, count: 20 },
      { _id: 4, count: 25 },
      { _id: 5, count: 30 },
      { _id: 6, count: 20 },
      { _id: 7, count: 15 },
      { _id: 8, count: 5 },
      { _id: 9, count: 10 },
    ],
  };

  if (!reportData) {
    return <div>Loading reports...</div>;
  }

  const hivesByApiaryData = {
    labels: reportData.hivesByApiary.map((item) => item._id),
    datasets: [
      {
        data: reportData.hivesByApiary.map((item) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  const inspectionsByMonthData = {
    labels: reportData.inspectionsByMonth.map((item) => {
      const date = new Date();
      date.setMonth(item._id - 1);
      return date.toLocaleString('default', { month: 'long' });
    }),
    datasets: [
      {
        label: 'Inspections',
        data: reportData.inspectionsByMonth.map((item) => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Beekeeping Reports</h1>
      <Link
        to="/"
        className="mb-6 inline-block px-4 py-2 bg-honey text-white rounded-lg hover:bg-honey-dark"
      >
        Back to Dashboard
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <p>Total Apiaries: {reportData.apiaryCount}</p>
          <p>Total Hives: {reportData.hiveCount}</p>
          <p>Total Inspections: {reportData.inspectionCount}</p>
          <p>Total Honey Production: {reportData.honeyProduction.totalHoney.toFixed(2)} kg</p>
          <p>Average Honey Production: {reportData.honeyProduction.avgHoney.toFixed(2)} kg</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Hives by Apiary</h2>
          <Doughnut data={hivesByApiaryData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Inspections by Month</h2>
          <Bar
            data={inspectionsByMonthData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Inspections',
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
