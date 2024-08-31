import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHiveContext } from '../../context/HiveContext';
import { useInView } from 'react-intersection-observer';
import HiveForm from './HiveForm';
import Modal from '../Modal';

const HIVES_PER_PAGE = 10;

const HiveList = () => {
  const { apiaryId } = useParams();
  const { useHives, useCreateHive, addHive } = useHiveContext();
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHives = async ({ pageParam = 1 }) => {
    const response = await fetch(`/api/hives?apiaryId=${apiaryId}&page=${pageParam}&limit=${HIVES_PER_PAGE}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery(
    ['hives', apiaryId],
    fetchHives,
    {
      getNextPageParam: (lastPage) =>
        lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    }
  );

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const createHiveMutation = useCreateHive();

  const handleCreateHive = (hiveData) => {
    createHiveMutation.mutate(hiveData, {
      onSuccess: (newHive) => {
        addHive(newHive);
        setIsModalOpen(false);
      },
    });
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
        Error: {status.error.message}
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
