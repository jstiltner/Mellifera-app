import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../common/Button';
import { InspectionDetail } from '../common/InspectionDetail';
import ReusableList from '../common/ReusableList';
import { addInspection } from '../../api/hiveApi';
import { errorToast, successToast } from '../../utils/errorHandling';

const InspectionSection = ({ hiveId, inspections, onInspectionAdded }) => {
  const [isAddingInspection, setIsAddingInspection] = useState(false);
  const [newInspectionData, setNewInspectionData] = useState({
    date: new Date().toISOString().split('T')[0],
    overallHealth: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const addInspectionMutation = useMutation({
    mutationFn: (inspectionData) => addInspection(hiveId, inspectionData),
    onSuccess: () => {
      console.log('Inspection added successfully');
      queryClient.invalidateQueries(['hive', hiveId]);
      successToast('Inspection added successfully');
      setIsAddingInspection(false);
      setNewInspectionData({
        date: new Date().toISOString().split('T')[0],
        overallHealth: '',
        notes: '',
      });
      onInspectionAdded();
    },
    onError: (error) => {
      console.error('Error adding inspection:', error);
      errorToast(error, 'Error adding inspection');
    },
  });

  const handleAddInspection = useCallback(() => {
    console.log('Adding inspection:', newInspectionData);
    addInspectionMutation.mutate(newInspectionData);
  }, [addInspectionMutation, newInspectionData]);

  const renderInspectionItem = (inspection) => (
    <InspectionDetail key={inspection._id} inspection={inspection} />
  );

  return (
    <div className="bg-gray-50 p-6 rounded-md shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-indigo-600">Recent Inspections</h2>
        <div className="space-x-2">
          {!isAddingInspection && (
            <Button
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              onClick={() => setIsAddingInspection(true)}
            >
              Add Inspection
            </Button>
          )}
        </div>
      </div>
      {isAddingInspection && (
        <div className="mb-4">
          <input
            type="date"
            value={newInspectionData.date}
            onChange={(e) => setNewInspectionData({ ...newInspectionData, date: e.target.value })}
            className="mb-2 p-2 border rounded"
          />
          <input
            type="text"
            value={newInspectionData.overallHealth}
            onChange={(e) => setNewInspectionData({ ...newInspectionData, overallHealth: e.target.value })}
            placeholder="Overall Health"
            className="mb-2 p-2 border rounded w-full"
          />
          <textarea
            value={newInspectionData.notes}
            onChange={(e) => setNewInspectionData({ ...newInspectionData, notes: e.target.value })}
            placeholder="Notes"
            className="mb-2 p-2 border rounded w-full"
          />
          <div className="flex justify-end space-x-2">
            <Button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              onClick={() => {
                console.log('Cancelling add inspection');
                setIsAddingInspection(false);
                setNewInspectionData({
                  date: new Date().toISOString().split('T')[0],
                  overallHealth: '',
                  notes: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              onClick={handleAddInspection}
            >
              Save Inspection
            </Button>
          </div>
        </div>
      )}
      <ReusableList
        items={inspections || []}
        renderItem={renderInspectionItem}
        keyExtractor={(inspection) => inspection._id}
        emptyMessage="No recent inspections."
        isLoading={false}
        isError={false}
        errorMessage=""
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      />
    </div>
  );
};

InspectionSection.propTypes = {
  hiveId: PropTypes.string.isRequired,
  inspections: PropTypes.array,
  onInspectionAdded: PropTypes.func.isRequired,
};

export default InspectionSection;
