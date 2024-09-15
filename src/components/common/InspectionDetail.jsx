import { Link, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const InspectionDetail = ({ inspection }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      navigate(`/inspections/${inspection._id}`);
    },
    [inspection._id, navigate]
  );

  return (
    <Link
      to={`/inspections/${inspection._id}`}
      onClick={handleClick}
      className="block mb-4 p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
    >
      <h3 className="text-lg font-semibold mb-2">
        Inspection on {new Date(inspection.date).toLocaleDateString()}
      </h3>
      <p>
        <strong>Overall Health:</strong> {inspection.overallHealth}
      </p>
      <p>
        <strong>Queen Seen:</strong> {inspection.queenSeen ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>Diseases Seen:</strong> {inspection.diseasesSeen || 'None'}
      </p>
      <p>
        <strong>Pests Seen:</strong> {inspection.pestsSeen || 'None'}
      </p>
      <p>
        <strong>Hive Temperament:</strong> {inspection.hiveTemperament}
      </p>
      {inspection.notes && (
        <p>
          <strong>Notes:</strong> {inspection.notes}
        </p>
      )}
    </Link>
  );
};
