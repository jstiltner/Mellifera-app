import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import HiveForm from './HiveForm';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApiary } from '../hooks/useApiaries';
import { useHives, useCreateHive } from '../hooks/useHives';
import VoiceCommander from '../components/voice/VoiceCommander';

const ApiaryDetails = () => {
  const { id: apiaryId } = useParams();
  const [isHiveFormOpen, setIsHiveFormOpen] = useState(false);

  const {
    data: apiary,
    isLoading: isApiaryLoading,
    isError: isApiaryError,
    error: apiaryError
  } = useApiary(apiaryId);

  const {
    data: hivesData,
    isLoading: isHivesLoading,
    isError: isHivesError,
    error: hivesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useHives({ apiaryId });

  const createHiveMutation = useCreateHive();

  // Debug logging
  useEffect(() => {
    console.log('Apiary loading:', isApiaryLoading);
    console.log('Apiary error:', isApiaryError);
    console.log('Apiary data:', apiary);

    console.log('Hives loading:', isHivesLoading);
    console.log('Hives error:', isHivesError);
    console.log('Hives data:', hivesData);

    if (isApiaryError) {
      console.error('Apiary error details:', apiaryError);
    }

    if (isHivesError) {
      console.error('Hives error details:', hivesError);
    }
  }, [isApiaryLoading, isApiaryError, apiary, isHivesLoading, isHivesError, hivesData, apiaryError, hivesError]);

  const handleAddHive = () => setIsHiveFormOpen(true);
  const handleCloseModal = () => setIsHiveFormOpen(false);

  const handleHiveSubmit = (hiveData) => {
    createHiveMutation.mutate(
      { apiaryId, hiveData },
      {
        onSuccess: () => {
          setIsHiveFormOpen(false);
        },
      }
    );
  };

  if (isApiaryLoading || isHivesLoading) return <LoadingSpinner />;
  if (isApiaryError) return <ErrorMessage message={apiaryError.message || 'Error fetching apiary details'} />;
  if (isHivesError) return <ErrorMessage message={hivesError.message || 'Error fetching hives'} />;
  if (!apiary) return <ErrorMessage message="Apiary not found" />;

  const hives = hivesData?.hives || [];
  console.log('Processed hives:', hives);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 m-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-indigo-700">{apiary.name || 'Unnamed Apiary'}</h2>
          <VoiceCommander />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-md shadow">
            <p className="mb-2">
              <span className="font-semibold text-gray-700">Location:</span> {apiary.location || 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Total Hives:</span> {hives.length}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow">
            <p className="mb-2">
              <span className="font-semibold text-gray-700">Created:</span>{' '}
              {apiary.createdAt ? new Date(apiary.createdAt).toLocaleDateString() : 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Last Updated:</span>{' '}
              {apiary.updatedAt ? new Date(apiary.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <Button onClick={handleAddHive} className="w-full md:w-auto mb-6">
          Add Hive
        </Button>
      </div>
      <div className="flex-grow overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-600">Hives</h3>
        {hives.length === 0 ? (
          <p className="text-gray-600 italic">No hives in this apiary yet.</p>
        ) : (
          <ul className="space-y-4">
            {hives?.map((hive) => (
              <li
                key={hive._id}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <Link
                  to={`/hives/${hive._id}`}
                  className="block hover:bg-gray-50 p-4 transition duration-300 ease-in-out"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-indigo-600">
                      {hive.name || 'Unnamed Hive'}
                    </h4>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {hive.status || 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>
                      <span className="font-medium text-gray-600">Boxes:</span> {hive.children?.length || 0}
                    </p>
                    <p>
                      <span className="font-medium text-gray-600">Queen ID:</span> {hive.queenId || 'N/A'}
                    </p>
                    <p className="col-span-2">
                      <span className="font-medium text-gray-600">Last Inspection:</span>{' '}
                      {hive.lastInspection
                        ? new Date(hive.lastInspection).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {hasNextPage && (
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full mt-4"
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
          </Button>
        )}
      </div>
      <Modal isOpen={isHiveFormOpen} onClose={handleCloseModal}>
        <HiveForm
          onSubmit={handleHiveSubmit}
          onClose={handleCloseModal}
          apiaryId={apiaryId}
        />
      </Modal>
    </div>
  );
};

export default ApiaryDetails;
