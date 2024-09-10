import React from 'react';
import { Link } from 'react-router-dom';

const BoxList = ({ boxes, hiveId }) => {
  if (!boxes || boxes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">No boxes found for this hive.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Boxes for Hive {hiveId}</h2>
      <ul className="space-y-4">
        {boxes.map((box) => (
          <li key={box._id} className="border-b pb-4">
            <Link
              to={`/boxes/${box._id}`}
              className="block hover:bg-gray-50 p-4 rounded transition duration-300 ease-in-out"
            >
              <h3 className="text-xl font-semibold text-blue-600">{box.name || `Box ${box.boxNumber}`}</h3>
              <p className="text-gray-600">Type: {box.type}</p>
              {box.description && <p className="text-gray-600 mt-2">Description: {box.description}</p>}
              <p className="text-gray-600">Frames: {box.frames}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoxList;
