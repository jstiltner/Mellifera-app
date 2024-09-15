import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { InspectionDetail } from '../common/InspectionDetail';
import ReusableList from '../common/ReusableList';
import useListData from '../../hooks/useListData';

const InspectionSection = ({ hiveId }) => {
  const {
    data: inspections,
    isLoading,
    isError,
    error,
    refetch,
  } = useListData(`inspections-${hiveId}`);

  const handleRefetchInspections = () => {
    refetch();
  };

  const renderInspectionItem = (inspection) => (
    <InspectionDetail key={inspection._id} inspection={inspection} />
  );

  return (
    <div className="bg-gray-50 p-6 rounded-md shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-indigo-600">Recent Inspections</h2>
        <div className="space-x-2">
          <Button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={handleRefetchInspections}
            aria-label="Refresh inspections"
          >
            Refresh
          </Button>
          <Link to={`/hives/${hiveId}/add-inspection`}>
            <Button
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              aria-label="Add new inspection"
            >
              Add Inspection
            </Button>
          </Link>
        </div>
      </div>
      <ReusableList
        items={inspections || []}
        renderItem={renderInspectionItem}
        keyExtractor={(inspection) => inspection._id}
        emptyMessage="No recent inspections."
        isLoading={isLoading}
        isError={isError}
        errorMessage={
          error ? `Error loading inspections: ${error.message}` : 'Error loading inspections'
        }
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      />
    </div>
  );
};

InspectionSection.propTypes = {
  hiveId: PropTypes.string.isRequired,
};

export default InspectionSection;
