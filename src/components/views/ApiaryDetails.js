import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import Button from '../Button';
import Modal from '../Modal';
import HiveForm from './HiveForm';
import { useAuthContext } from '../../context/AuthContext';
import { useApiaries } from '../../hooks/useApiaries';
import { useCreateHive } from '../../hooks/useHives';

const ApiaryDetails = () => {
  const { id: apiaryId } = useParams();
  const [isHiveFormOpen, setIsHiveFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { token } = useAuthContext();

  const { data: apiaries, isLoading, isError } = useApiaries();
  const apiary = apiaries?.find(a => a._id === apiaryId);

  const createHiveMutation = useCreateHive();

  if (isLoading) return <div className="text-center p-4">Loading apiary details...</div>;
  if (isError)
    return <div className="text-center p-4 text-red-500">Error fetching apiary details</div>;
  if (!apiary)
    return <div className="text-center p-4 text-red-500">Apiary not found</div>;

  const handleAddHive = () => {
    setIsHiveFormOpen(true);
  };

  const handleHiveSubmit = (hiveData) => {
    createHiveMutation.mutate(
      { ...hiveData, apiaryId },
      {
        onSuccess: (newHive) => {
          // Update the local cache immediately
          queryClient.setQueryData(['apiaries'], (oldData) => {
            return oldData.map(oldApiary => 
              oldApiary._id === apiaryId 
                ? { ...oldApiary, children: [...(oldApiary.children || []), newHive] }
                : oldApiary
            );
          });

          // Invalidate and refetch to ensure consistency with the server
          queryClient.invalidateQueries(['apiaries']);
          
          setIsHiveFormOpen(false);
        },
      }
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 m-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700">
        {apiary?.name || 'Unnamed Apiary'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-md shadow">
          <p className="mb-2">
            <span className="font-semibold text-gray-700">Location:</span>{' '}
            {apiary?.location || 'N/A'}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Total Hives:</span>{' '}
            {apiary?.children?.length || 0}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md shadow">
          <p className="mb-2">
            <span className="font-semibold text-gray-700">Created:</span>{' '}
            {apiary?.createdAt ? new Date(apiary.createdAt).toLocaleDateString() : 'N/A'}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Last Updated:</span>{' '}
            {apiary?.updatedAt ? new Date(apiary.updatedAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
      <Button onClick={handleAddHive} className="w-full md:w-auto mb-6">
        Add Hive
      </Button>
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-600">Hives</h3>
        {!apiary?.children || apiary.children.length === 0 ? (
          <p className="text-gray-600 italic">No hives in this apiary yet.</p>
        ) : (
          <ul className="space-y-4">
            {apiary.children.map((hive) => (
              <li
                key={hive?._id}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <Link
                  to={`/hives/${hive?._id}`}
                  className="block hover:bg-gray-50 p-4 transition duration-300 ease-in-out"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-indigo-600">
                      {hive?.name || 'Unnamed Hive'}
                    </h4>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {hive?.status || 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>
                      <span className="font-medium text-gray-600">Boxes:</span>{' '}
                      {hive.children?.length || 0}
                    </p>
                    <p>
                      <span className="font-medium text-gray-600">Queen ID:</span>{' '}
                      {hive?.queenId || 'N/A'}
                    </p>
                    <p className="col-span-2">
                      <span className="font-medium text-gray-600">Last Inspection:</span>{' '}
                      {hive?.lastInspection
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
      <Modal isOpen={isHiveFormOpen} onClose={() => setIsHiveFormOpen(false)}>
        <HiveForm
          onSubmit={handleHiveSubmit}
          initialData={{ apiaryId: apiaryId }}
          apiaries={[apiary]}
        />
      </Modal>
    </div>
  );
};

export default ApiaryDetails;
