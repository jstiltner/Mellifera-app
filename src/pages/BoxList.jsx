import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Menu from '../components/layout/Menu';

const BoxList = ({ boxes, hiveId }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-md shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-indigo-600">Boxes</h2>
        <Button
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          onClick={() => {
            /* TODO: Implement add box functionality */
          }}
        >
          Add Box
        </Button>
      </div>
      {!boxes || boxes.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">No boxes found for this hive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boxes.map((box) => (
            <Link
              key={box._id}
              to={`/boxes/${box._id}`}
              className="block bg-white hover:bg-gray-50 p-4 rounded-lg shadow transition duration-300 ease-in-out"
            >
              <h3 className="text-xl font-semibold text-indigo-600 mb-2">
                {box.name || `Box ${box.boxNumber}`}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Type:</span> {box.type}
                </p>
                <p>
                  <span className="font-medium">Frames:</span> {box.frames}
                </p>
                {box.description && (
                  <p className="mt-2 text-gray-500 truncate">{box.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoxList;
