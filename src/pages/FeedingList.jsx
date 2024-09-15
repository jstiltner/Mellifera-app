import { useQuery } from '@tanstack/react-query';
import Menu from '../components/layout/Menu';
import ReusableList from '../components/common/ReusableList';
import { useFeedings } from '../hooks/useFeedings';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FeedingList = () => {
  const { getFeedings } = useFeedings();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['feedings'],
    queryFn: getFeedings,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  const feedings = Array.isArray(data) ? data : [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <aside className="w-full md:w-64 bg-white shadow-md p-4 md:h-screen md:overflow-y-auto">
        <Menu />
      </aside>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold my-4">Feeding List</h1>
        <ReusableList
          items={feedings}
          renderItem={(feeding) => (
            <div className="bg-white shadow rounded-lg p-4 mb-4">
              <h2 className="text-xl font-semibold">{feeding.hive?.name || 'Unknown Hive'}</h2>
              <p>Date: {new Date(feeding.date).toLocaleDateString()}</p>
              <p>Type: {feeding.type || 'N/A'}</p>
              <p>Amount: {feeding.amount || 'N/A'}</p>
            </div>
          )}
          keyExtractor={(feeding) => feeding.id || `${feeding.hive?.name}-${feeding.date}`}
          emptyMessage="No feedings found"
        />
      </div>
    </div>
  );
};

export default FeedingList;
