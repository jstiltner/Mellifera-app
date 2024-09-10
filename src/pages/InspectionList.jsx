import React from 'react';

const InspectionList = ({ inspections, onEdit, onDelete }) => {
  if (!inspections || inspections.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Inspections</h2>
        <p className="text-gray-600">No inspections found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Inspections</h2>
      <ul className="space-y-4">
        {inspections.map((inspection) => (
          <li key={inspection._id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2">Hive: {inspection.hiveId}</h3>
            <p>
              <strong>Date:</strong> {new Date(inspection.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Queen Seen:</strong> {inspection.queenSeen ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Eggs Seen:</strong> {inspection.eggsSeen ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Larvae Seen:</strong> {inspection.larvaeSeen ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Capped Brood Seen:</strong> {inspection.cappedBroodSeen ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Honey Stores:</strong> {inspection.honeyStores}
            </p>
            <p>
              <strong>Temperament:</strong> {inspection.temperament}
            </p>
            <p>
              <strong>Diseases:</strong> {inspection.diseases || 'None'}
            </p>
            <p>
              <strong>Notes:</strong> {inspection.notes || 'No notes'}
            </p>
            <div className="mt-4 space-x-2">
              <button
                onClick={() => onEdit(inspection)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this inspection?')) {
                    onDelete(inspection._id);
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InspectionList;
