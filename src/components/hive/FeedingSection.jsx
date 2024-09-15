import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useFeedings } from '../../hooks/useFeedings';
import Button from '../common/Button';
import ReusableList from '../common/ReusableList';
import useListData from '../../hooks/useListData';

const FeedingSection = ({ hiveId }) => {
  const queryClient = useQueryClient();
  const { addFeeding, updateFeeding, deleteFeeding } = useFeedings();

  const { data: feedings, isLoading, isError } = useListData(`feedings-${hiveId}`);

  const addFeedingMutation = useMutation({
    mutationFn: addFeeding,
    onSuccess: () => {
      queryClient.invalidateQueries([`feedings-${hiveId}`]);
    },
  });

  const updateFeedingMutation = useMutation({
    mutationFn: updateFeeding,
    onSuccess: () => {
      queryClient.invalidateQueries([`feedings-${hiveId}`]);
    },
  });

  const deleteFeedingMutation = useMutation({
    mutationFn: deleteFeeding,
    onSuccess: () => {
      queryClient.invalidateQueries([`feedings-${hiveId}`]);
    },
  });

  const handleAddFeeding = (feedingData) => {
    addFeedingMutation.mutate({ ...feedingData, hiveId });
  };

  const handleUpdateFeeding = (id, feedingData) => {
    updateFeedingMutation.mutate({ id, ...feedingData });
  };

  const handleDeleteFeeding = (id) => {
    deleteFeedingMutation.mutate(id);
  };

  const renderFeedingItem = (feeding) => (
    <div className="bg-white p-4 rounded shadow">
      <p>
        <strong>Date:</strong> {format(new Date(feeding.date), 'yyyy-MM-dd')}
      </p>
      <p>
        <strong>Type:</strong> {feeding.type}
      </p>
      <p>
        <strong>Amount:</strong> {feeding.amount} {feeding.units}
      </p>
      {feeding.notes && (
        <p>
          <strong>Notes:</strong> {feeding.notes}
        </p>
      )}
      <div className="mt-2 space-x-2">
        <button
          onClick={() => handleUpdateFeeding(feeding._id, { ...feeding })}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteFeeding(feeding._id)}
          className="bg-red-500 text-white px-2 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 p-6 rounded-md shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-indigo-600">Feedings</h2>
        <Button
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          aria-label="Add new Feeding"
          onClick={() =>
            handleAddFeeding({ date: new Date(), type: '1:1 Syrup', amount: 1, units: 'liters' })
          }
        >
          Add Feeding
        </Button>
      </div>
      <ReusableList
        items={feedings || []}
        renderItem={renderFeedingItem}
        keyExtractor={(feeding) => feeding._id}
        emptyMessage="No feedings recorded yet for this hive."
        isLoading={isLoading}
        isError={isError}
        errorMessage="Error loading feedings"
        className="space-y-4"
      />
    </div>
  );
};

export default FeedingSection;
