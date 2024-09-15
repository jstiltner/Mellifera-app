import Menu from '../components/layout/Menu';
import ReusableList from '../components/common/ReusableList';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAllHives } from '../hooks/useAllHives';

const QueenManagement = () => {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useAllHives();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  const hives = data?.pages?.flatMap((page) => page.hives) || [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <aside className="w-full md:w-64 bg-white shadow-md p-4 md:h-screen md:overflow-y-auto">
        <Menu />
      </aside>
      <main className="flex-grow p-6">
        <h1 className="text-2xl font-bold my-4">Queen Management</h1>
        {hives.length === 0 ? (
          <p>No hives found.</p>
        ) : (
          <>
            <ReusableList
              items={hives}
              renderItem={(hive) => (
                <div className="bg-white shadow rounded-lg p-4 mb-4">
                  <h2 className="text-xl font-semibold">{hive.name}</h2>
                  <p>Apiary: {hive.apiary?.name || 'Unknown'}</p>
                  <p>Queen Age: {hive.queenAge || 'Unknown'}</p>
                  <p>Queen Type: {hive.queenType || 'Unknown'}</p>
                  <p>Queen Marked: {hive.queenMarked ? 'Yes' : 'No'}</p>
                  <p>
                    Last Queen Sighting:{' '}
                    {hive.lastQueenSighting
                      ? new Date(hive.lastQueenSighting).toLocaleDateString()
                      : 'Unknown'}
                  </p>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
                    Manage Queen
                  </button>
                </div>
              )}
              keyExtractor={(hive) => hive._id}
            />
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
              >
                Load More
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default QueenManagement;
