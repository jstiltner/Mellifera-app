import { useQuery } from '@tanstack/react-query';
import Menu from '../components/layout/Menu';
import ReusableList from '../components/common/ReusableList';
import { useInspections } from '../hooks/useInspections';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const InspectionList = () => {
  const { getInspections } = useInspections();
  const {
    data: inspections,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['inspections'],
    queryFn: getInspections,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  return (
    <div className="container mx-auto px-4">
      <Menu />
      <h1 className="text-2xl font-bold my-4">Inspection List</h1>
      <ReusableList
        items={inspections}
        renderItem={(inspection) => (
          <div className="bg-white shadow rounded-lg p-4 mb-4">
            <h2 className="text-xl font-semibold">{inspection.hive.name}</h2>
            <p>Date: {new Date(inspection.date).toLocaleDateString()}</p>
            <p>Queen Seen: {inspection.queenSeen ? 'Yes' : 'No'}</p>
            <p>Brood Pattern: {inspection.broodPattern}</p>
            <p>Hive Strength: {inspection.hiveStrength}</p>
          </div>
        )}
      />
    </div>
  );
};

export default InspectionList;
