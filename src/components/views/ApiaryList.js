import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../Button';
import Modal from '../Modal';
import HiveForm from './HiveForm';
import ApiaryForm from './ApiaryForm';
import { useApiaries, useCreateApiary } from '../../hooks/useApiaries';
import { useCreateHive } from '../../hooks/useHives';

const ApiaryList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApiaryId, setSelectedApiaryId] = useState(null);

  const queryClient = useQueryClient();
  const { data: apiaries = [], isLoading, isError } = useApiaries({
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
  const createApiaryMutation = useCreateApiary();
  const createHiveMutation = useCreateHive();

  const handleAddHive = (apiaryId) => {
    setSelectedApiaryId(apiaryId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApiaryId(null);
  };

  const handleSubmitHive = async (formData) => {
    createHiveMutation.mutate(formData, {
      onSuccess: () => {
        queryClient.invalidateQueries(['apiaries']);
        queryClient.invalidateQueries(['hives']);
        handleCloseModal();
      },
      // Implement optimistic update
      onMutate: async (newHive) => {
        await queryClient.cancelQueries(['apiaries']);
        const previousApiaries = queryClient.getQueryData(['apiaries']);
        queryClient.setQueryData(['apiaries'], (old) =>
          old.map((apiary) =>
            apiary._id === newHive.apiaryId
              ? { ...apiary, children: [...(apiary.children || []), newHive] }
              : apiary
          )
        );
        return { previousApiaries };
      },
      onError: (err, newHive, context) => {
        queryClient.setQueryData(['apiaries'], context.previousApiaries);
      },
    });
  };

  const handleCreateApiary = (newApiary) => {
    createApiaryMutation.mutate(newApiary, {
      onSuccess: () => {
        queryClient.invalidateQueries(['apiaries']);
      },
      // Implement optimistic update
      onMutate: async (newApiary) => {
        await queryClient.cancelQueries(['apiaries']);
        const previousApiaries = queryClient.getQueryData(['apiaries']);
        queryClient.setQueryData(['apiaries'], (old) => [...old, { ...newApiary, _id: 'temp-id' }]);
        return { previousApiaries };
      },
      onError: (err, newApiary, context) => {
        queryClient.setQueryData(['apiaries'], context.previousApiaries);
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching apiaries</div>;

  return (
    <>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Your Apiaries</h2>
        <ApiaryForm onApiaryCreate={handleCreateApiary} />
        {apiaries.length === 0 ? (
          <p className="text-gray-600">You don't have any apiaries yet.</p>
        ) : (
          <ul className="space-y-4">
            {apiaries.map((apiary) => (
              <li key={apiary._id} className="border-b pb-4">
                <Link
                  to={`/apiary/${apiary._id}`}
                  className="block hover:bg-gray-50 p-4 rounded transition duration-300 ease-in-out"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-blue-600">
                        {apiary.name || 'Unnamed Apiary'}
                      </h3>
                      <p className="text-gray-600">Location: {apiary.location || 'Unknown'}</p>
                      {apiary.notes && <p className="text-gray-600 mt-2">Notes: {apiary.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-700 font-semibold">
                        {apiary.children?.length || 0} Hives
                      </p>
                      {apiary.lastInspection && (
                        <p className="text-gray-600">
                          Last Inspection: {new Date(apiary.lastInspection).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {apiary.alerts && apiary.alerts.length > 0 && (
                    <div className="mt-3 p-2 bg-yellow-100 rounded">
                      <p className="font-semibold text-yellow-700">Alerts:</p>
                      <ul className="list-disc list-inside">
                        {apiary.alerts.map((alert, alertIndex) => (
                          <li key={alertIndex} className="text-yellow-700">
                            {alert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Link>
                <Button type="button" onClick={() => handleAddHive(apiary._id)} className="mt-2">
                  Add Hive
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-2xl font-bold mb-4">Add New Hive</h2>
        <HiveForm
          onSubmit={handleSubmitHive}
          apiaries={apiaries}
          initialData={{ apiaryId: selectedApiaryId }}
        />
      </Modal>
    </>
  );
};

export default ApiaryList;
