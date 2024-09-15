import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import HiveForm from './HiveForm';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchApiary, fetchHives, createHive } from '../api/apiaryApi';
import Menu from '../components/layout/Menu';
import { HiveDiagram } from '../components/hive';
import ErrorBoundary from '../components/common/ErrorBoundary';

const ApiaryDetails = () => {
  const { id: apiaryId } = useParams();
  const [isHiveFormOpen, setIsHiveFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const apiaryQuery = useQuery({
    queryKey: ['apiary', apiaryId],
    queryFn: () => fetchApiary(apiaryId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const hivesQuery = useQuery({
    queryKey: ['hives', apiaryId],
    queryFn: () => fetchHives({ apiaryId }),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const createHiveMutation = useMutation({
    mutationFn: (hiveData) => createHive({ apiaryId, hiveData }),
    onSuccess: () => {
      queryClient.invalidateQueries(['hives', apiaryId]);
      setIsHiveFormOpen(false);
    },
    onError: (error) => {
      console.error('Failed to create hive:', error);
      // You could set an error state here and display it to the user
    },
  });

  const handleAddHive = () => setIsHiveFormOpen(true);
  const handleCloseModal = () => setIsHiveFormOpen(false);

  const handleHiveSubmit = (hiveData) => {
    createHiveMutation.mutate(hiveData);
  };

  if (apiaryQuery.isLoading || hivesQuery.isLoading) return <LoadingSpinner />;
  if (apiaryQuery.isError)
    return <ErrorMessage message={apiaryQuery.error.message || 'Error fetching apiary details'} />;
  if (hivesQuery.isError)
    return <ErrorMessage message={hivesQuery.error.message || 'Error fetching hives'} />;
  if (!apiaryQuery.data) return <ErrorMessage message="Apiary not found" />;

  const apiary = apiaryQuery.data;
  const hives = hivesQuery.data || [];

  console.log('Hives data:', hives); // Debug log

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-100">
        <aside className="w-64 bg-white shadow-md p-4 overflow-y-auto">
          <Menu />
        </aside>
        <div className="flex-grow overflow-hidden">
          <div className="bg-white shadow-lg rounded-lg p-4 m-2 h-[calc(100vh-1rem)] overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-amber-700">
                  {apiary.name || 'Unnamed Apiary'}
                </h2>
                <Button
                  onClick={handleAddHive}
                  className="w-auto"
                  disabled={createHiveMutation.isPending}
                >
                  {createHiveMutation.isPending ? 'Adding...' : 'Add Hive'}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-md shadow">
                  <p className="mb-2">
                    <span className="font-semibold text-gray-700">Location:</span>{' '}
                    {apiary.location || 'N/A'}
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
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-4 text-indigo-600">Hive Diagram</h3>
                {hivesQuery.isLoading ? (
                  <LoadingSpinner />
                ) : hives.length > 0 ? (
                  <ErrorBoundary fallback={<ErrorMessage message="Error rendering Hive Diagram" />}>
                    <HiveDiagram data={hives} />
                  </ErrorBoundary>
                ) : (
                  <p className="text-gray-600 italic">No hives to display in the diagram.</p>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-indigo-600">Hive List</h3>
                {hives.length === 0 ? (
                  <p className="text-gray-600 italic">No hives in this apiary yet.</p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hives.map((hive) => (
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
                              {hive.name || `Hive ${hive._id}`}
                            </h4>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                              {hive.status || 'N/A'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p>
                              <span className="font-medium text-gray-600">Boxes:</span>{' '}
                              {hive.children?.length || 0}
                            </p>
                            <p>
                              <span className="font-medium text-gray-600">Queen ID:</span>{' '}
                              {hive.queenId || 'N/A'}
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
              </div>
            </div>
          </div>
        </div>
        <Modal isOpen={isHiveFormOpen} onClose={handleCloseModal}>
          <HiveForm onSubmit={handleHiveSubmit} onClose={handleCloseModal} apiaryId={apiaryId} />
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default ApiaryDetails;
