import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useHives, useCreateHive } from '../../hooks/useHives';
import HiveForm from './HiveForm';
import Modal from '../Modal';
import { errorToast } from '../../utils/errorHandling';

const HIVES_PER_PAGE = 10;

const HiveList = () => {
  const { apiaryId } = useParams();
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
  } = useHives(apiaryId);

  const createHiveMutation = useCreateHive();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCreateHive = async (hiveData) => {
    try {
      await createHiveMutation.mutateAsync({ apiaryId, hiveData });
      setIsModalOpen(false);
    } catch (error) {
      errorToast(error, 'Error creating hive');
    }
  };

  if (status === 'loading') {
    return (
      <div className="text-center py-4" aria-live="polite">
        <span className="sr-only">Loading hives</span>
        <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
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

  const hives = data?.pages.flatMap((page) => page.hives) || [];

  return (
    <div className="container mx-auto px-4">
      <h1 className="sr-only">Hive List</h1>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{data?.pages[0]?.totalHives || 0} Hives</h2>
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
              <Link
                to={`/hives/${hive._id}`}
                className="block focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
              >
                <h3 className="text-xl font-semibold mb-2">{hive.name}</h3>
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
              </Link>
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
