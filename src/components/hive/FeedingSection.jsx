import { format } from 'date-fns';
import Button from '../common/Button';
import ReusableList from '../common/ReusableList';

const FeedingSection = ({ hiveId, feedings, onAddFeeding }) => {
  const renderFeedingItem = (feeding) => (
    <div className="bg-white p-4 rounded shadow">
      <p>
        <strong>Date:</strong> {format(new Date(feeding.date), 'yyyy-MM-dd')}
      </p>
      <p>
        <strong>Type:</strong> {feeding.type}
      </p>
      <p>
        <strong>Amount:</strong> {feeding.amount}
      </p>
      {feeding.notes && (
        <p>
          <strong>Notes:</strong> {feeding.notes}
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 p-6 rounded-md shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-indigo-600">Feedings</h2>
        <Button
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          aria-label="Add new Feeding"
          onClick={onAddFeeding}
        >
          Add Feeding
        </Button>
      </div>
      <ReusableList
        items={feedings || []}
        renderItem={renderFeedingItem}
        keyExtractor={(feeding) => feeding._id}
        emptyMessage="No feedings recorded yet for this hive."
        className="space-y-4"
      />
    </div>
  );
};

export default FeedingSection;
