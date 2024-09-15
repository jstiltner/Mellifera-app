import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useCreateHive } from '../hooks/useHives';
import HiveForm from './HiveForm';
import Modal from '../components/common/Modal';
import ReusableList from '../components/common/ReusableList';
import useListData from '../hooks/useListData';
import Menu from '../components/layout/Menu';
import VoiceControl from '../components/voice/VoiceControl';

const HiveList = () => {
  const { apiaryId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { ref, inView } = useInView();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error, refetch } =
    useListData(`hives-${apiaryId}`);

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
            queryClient.invalidateQueries([`hives-${apiaryId}`]);
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

  const handleVoiceCommand = useCallback(
    (action, entity, text) => {
      switch (action) {
        case 'create':
          if (entity === 'hive') {
            setIsModalOpen(true);
          }
          break;
        case 'open':
          if (entity === 'hive') {
            const hiveToOpen = data?.pages
              ?.flatMap((page) => page.hives)
              .find((hive) => hive.name.toLowerCase() === text.toLowerCase());
            if (hiveToOpen) {
              navigate(`/hives/${hiveToOpen._id}`);
            } else {
              console.log(`Hive "${text}" not found`);
            }
          }
          break;
        default:
          console.log(`Unhandled voice command: ${action} ${entity}`);
      }
    },
    [data, navigate]
  );

  const renderHiveItem = (hive) => (
    <div className="border rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
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
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <aside className="w-full md:w-64 bg-white shadow-md p-4 md:h-screen md:overflow-y-auto">
        <Menu />
      </aside>
      <div className="container mx-auto px-4">
        <h1 className="sr-only">Hive List</h1>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{data?.pages?.[0]?.hives?.length || 0} Hives</h2>
          <div className="flex items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 mr-4"
            >
              Create New Hive
            </button>
            <VoiceControl onCommand={handleVoiceCommand} />
          </div>
        </div>
        <ReusableList
          items={data?.pages?.flatMap((page) => page.hives) || []}
          renderItem={renderHiveItem}
          keyExtractor={(hive) => hive._id}
          emptyMessage="No hives found. Create a new hive to get started."
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        />
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
    </div>
  );
};

export default HiveList;
