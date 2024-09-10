import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useHives, useCreateHive } from '../hooks/useHives';
import HiveForm from './HiveForm';
import Modal from '../components/Modal';

const HiveList = () => {
  const { apiaryId } = useParams();
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    refetch
  } = useHives({ apiaryId });

  // Debug logs
  useEffect(() => {
    console.log('HiveList data:', data);
    console.log('HiveList status:', status);
    if (error) {
      console.error('HiveList error:', error);
    }
  }, [data, status, error]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const createHiveMutation = useCreateHive();

  const handleCreateHive = async (hiveData) => {
    try {
      await createHiveMutation.mutateAsync(
        { apiaryId, hiveData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(['hives', apiaryId]);
            queryClient.invalidateQueries(['apiaries']);
            refetch();
            setIsModalOpen(false);
          },
        }
      );
    } catch (error) {
      console.error('Error creating hive:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  if (status === 'loading') {
    return (
      <div className="text-center py-4" aria-live="polite">
        Loading hives...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-4 text-red-600" aria-live="assertive">
        Error: {error.message}
      </div>
    );
  }

  const hives = data?.hives || [];

  return (
    <div className="container mx-auto px-4">
      <h1 className="sr-only">Hive List</h1>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{hives.length} Hives</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
        >
          Create New Hive
        </button>
      </div>
      {hives.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
          {hives.map((hive) => (
            <li
              key={hive._id}
              className="border rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <Link
                  to={`/hives/${hive._id}`}
                  className="text-xl font-semibold hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                >
                  {hive.name}
                </Link>
                <Link
                  to={`/hives/${hive._id}/edit`}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
                >
                  Edit
                </Link>
              </div>
              <dl>
                <div>
                  <dt className="sr-only">Queen ID</dt>
                  <dd className="text-gray-600">Queen ID: {hive.queenId}</dd>
                </div>
                <div>
                  <dt className="sr-only">Status</dt>
                  <dd className="text-gray-600">Status: {hive.status}</dd>
                </div>
                <div>
                  <dt className="sr-only">Notes</dt>
                  <dd className="text-gray-600 truncate">Notes: {hive.notes}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center py-4" aria-live="polite">
          No hives found. Create a new hive to get started.
        </p>
      )}
      {hasNextPage && (
        <div ref={ref} className="text-center py-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50"
            aria-busy={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load more'}
          </button>
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <HiveForm
          apiaries={[{ _id: apiaryId, name: 'Current Apiary' }]}
          onSuccess={handleCreateHive}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default HiveList;
