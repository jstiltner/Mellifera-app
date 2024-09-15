import { useQuery } from '@tanstack/react-query';
import Menu from '../components/layout/Menu';
import ReusableList from '../components/common/ReusableList';
import { useTreatments } from '../hooks/useTreatments';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TreatmentList = () => {
  const { getTreatments } = useTreatments();
  const {
    data: treatments,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['treatments'],
    queryFn: getTreatments,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  return (
    <div className="container mx-auto px-4">
      <Menu />
      <h1 className="text-2xl font-bold my-4">Treatment List</h1>
      <ReusableList
        items={treatments}
        renderItem={(treatment) => (
          <div className="bg-white shadow rounded-lg p-4 mb-4">
            <h2 className="text-xl font-semibold">{treatment.hive.name}</h2>
            <p>Date: {new Date(treatment.date).toLocaleDateString()}</p>
            <p>Type: {treatment.type}</p>
            <p>Method: {treatment.method}</p>
            <p>Duration: {treatment.duration} days</p>
          </div>
        )}
      />
    </div>
  );
};

export default TreatmentList;
