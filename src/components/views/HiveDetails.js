import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '../Button';
import BoxForm from '../BoxForm';
import Modal from '../Modal';
import { useHive, useAddBox, useUpdateBox, useDeleteBox } from '../../hooks/useHives';
import { useInspections } from '../../hooks/useInspections';
import { errorToast } from '../../utils/errorHandling';

const HiveDetail = ({ label, value }) => (
  <div className="mb-2">
    <span className="font-semibold">{label}:</span> {value?.toString() || 'N/A'}
  </div>
);

const InspectionDetail = ({ inspection, hiveId }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    navigate(`/hives/${hiveId}/inspections/${inspection._id}`);
  };

  return (
    <Link 
      to={`/hives/${hiveId}/inspections/${inspection._id}`} 
      onClick={handleClick}
      className="block mb-4 p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
    >
      <h3 className="text-lg font-semibold mb-2">
        Inspection on {new Date(inspection.date).toLocaleDateString()}
      </h3>
      <p><strong>Overall Health:</strong> {inspection.overallHealth}</p>
      <p><strong>Queen Seen:</strong> {inspection.queenSeen ? 'Yes' : 'No'}</p>
      <p><strong>Diseases Seen:</strong> {inspection.diseasesSeen || 'None'}</p>
      <p><strong>Pests Seen:</strong> {inspection.pestsSeen || 'None'}</p>
      <p><strong>Hive Temperament:</strong> {inspection.hiveTemperament}</p>
      {inspection.notes && <p><strong>Notes:</strong> {inspection.notes}</p>}
    </Link>
  );
};

const HiveDetails = () => {
  const { id } = useParams();
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);

  const {
    data: hive,
    isLoading: isHiveLoading,
    isError: isHiveError,
    error: hiveError,
  } = useHive({ hiveId: id });

  const {
    data: inspections,
    isLoading: isInspectionsLoading,
    isError: isInspectionsError,
    error: inspectionsError,
    refetch: refetchInspections,
  } = useInspections({ hiveId: id });

  const addBoxMutation = useAddBox();
  const updateBoxMutation = useUpdateBox();
  const deleteBoxMutation = useDeleteBox();

  if (isHiveLoading || isInspectionsLoading) {
    return (
      <div className="text-center py-4" aria-live="polite">
        <span className="sr-only">Loading hive details</span>
        <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (isHiveError || isInspectionsError) {
    return (
      <div className="text-red-500 text-center py-4" aria-live="assertive">
        Error: {(hiveError || inspectionsError)?.message || 'An error occurred while fetching data. Please try again later.'}
      </div>
    );
  }

  if (!hive) {
    return (
      <div className="text-center py-4" aria-live="assertive">
        No hive found
      </div>
    );
  }

  const handleAddBox = async (boxData) => {
    try {
      await addBoxMutation.mutateAsync({ hiveId: id, boxData });
      setIsBoxModalOpen(false);
    } catch (error) {
      errorToast(error, 'Error adding box');
    }
  };

  const handleUpdateBox = async (updatedBoxData) => {
    try {
      await updateBoxMutation.mutateAsync({ hiveId: id, boxId: updatedBoxData._id, boxData: updatedBoxData });
      setIsBoxModalOpen(false);
      setSelectedBox(null);
    } catch (error) {
      errorToast(error, 'Error updating box');
    }
  };

  const handleDeleteBox = async (boxId) => {
    try {
      await deleteBoxMutation.mutateAsync({ hiveId: id, boxId });
      setIsBoxModalOpen(false);
      setSelectedBox(null);
    } catch (error) {
      errorToast(error, 'Error deleting box');
    }
  };

  const boxCount = Array.isArray(hive.children) ? hive.children.length : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{hive.name}</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Hive Details</h2>
        <HiveDetail label="Type" value={hive.type} />
        <HiveDetail label="Status" value={hive.status} />
        <HiveDetail label="Queen Present" value={hive.queenPresent ? 'Yes' : 'No'} />
        <HiveDetail label="Box Count" value={boxCount} />
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          {boxCount === 0 ? 'No boxes' : boxCount === 1 ? '1 box' : `${boxCount} boxes`}
        </h2>
        {boxCount > 0 ? (
          <ul className="list-disc pl-5 mb-4">
            {hive.children.map((box, index) => (
              <li key={box._id || index} className="mb-1">
                Box {box.boxNumber}: {box.type} ({box.frames} frames)
                <Button
                  className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                  onClick={() => {
                    setSelectedBox(box);
                    setIsBoxModalOpen(true);
                  }}
                >
                  Edit
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4">No boxes added to this hive yet.</p>
        )}
        <Button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            setSelectedBox(null);
            setIsBoxModalOpen(true);
          }}
        >
          Add Box
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Recent Inspections</h2>
          <Button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => refetchInspections()}
          >
            Refresh Inspections
          </Button>
        </div>
        {Array.isArray(inspections) && inspections.length > 0 ? (
          <div>
            {inspections.map((inspection) => (
              <InspectionDetail key={inspection._id} inspection={inspection} hiveId={id} />
            ))}
          </div>
        ) : (
          <p className="mb-4">No recent inspections.</p>
        )}
        <Link to={`/hives/${id}/add-inspection`}>
          <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Add Inspection
          </Button>
        </Link>
      </div>

      <Modal isOpen={isBoxModalOpen} onClose={() => {
        setIsBoxModalOpen(false);
        setSelectedBox(null);
      }}>
        <BoxForm
          initialBox={selectedBox}
          onAddBox={handleAddBox}
          onUpdateBox={handleUpdateBox}
          onDeleteBox={handleDeleteBox}
        />
      </Modal>
    </div>
  );
};

export default HiveDetails;
