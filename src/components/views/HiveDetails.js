import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../Button';
import BoxForm from '../BoxForm';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';
import { useInspections } from '../../hooks/useInspections';
import { errorToast } from '../../utils/errorHandling';
import { fetchHive, addBox, updateBox, deleteBox } from '../../api/hiveApi';

const HiveDetail = ({ label, value }) => (
  <div className="mb-2">
    <span className="font-semibold">{label}:</span> {value?.toString() ?? 'N/A'}
  </div>
);

const InspectionDetail = ({ inspection, hiveId }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    navigate(`/inspections/${inspection._id}`);
  };

  return (
    <Link 
      to={`/inspections/${inspection._id}`} 
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
  const queryClient = useQueryClient();

  const {
    data: hive,
    isLoading: isHiveLoading,
    isError: isHiveError,
    error: hiveError,
  } = useQuery({
    queryKey: ['hive', id],
    queryFn: () => fetchHive(id),
    enabled: !!id, // Only run the query if id is truthy
  });

  const {
    data: inspections,
    isLoading: isInspectionsLoading,
    isError: isInspectionsError,
    error: inspectionsError,
    refetch: refetchInspections,
  } = useInspections({ hiveId: id });

  const addBoxMutation = useMutation({
    mutationFn: ({ hiveId, boxData }) => addBox(hiveId, boxData),
    onSuccess: () => {
      queryClient.invalidateQueries(['hive', id]);
      setIsBoxModalOpen(false);
    },
    onError: (error) => errorToast(error, 'Error adding box'),
  });

  const updateBoxMutation = useMutation({
    mutationFn: ({ hiveId, boxId, boxData }) => updateBox(hiveId, boxId, boxData),
    onSuccess: () => {
      queryClient.invalidateQueries(['hive', id]);
      setIsBoxModalOpen(false);
      setSelectedBox(null);
    },
    onError: (error) => errorToast(error, 'Error updating box'),
  });

  const deleteBoxMutation = useMutation({
    mutationFn: ({ hiveId, boxId }) => deleteBox(hiveId, boxId),
    onSuccess: () => {
      queryClient.invalidateQueries(['hive', id]);
      setIsBoxModalOpen(false);
      setSelectedBox(null);
    },
    onError: (error) => errorToast(error, 'Error deleting box'),
  });

  if (!id) {
    return <div className="text-red-500 text-center py-4">Invalid Hive ID</div>;
  }

  if (isHiveLoading || isInspectionsLoading) {
    return <LoadingSpinner />;
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

  const handleAddBox = (boxData) => {
    addBoxMutation.mutate({ hiveId: id, boxData });
  };

  const handleUpdateBox = (updatedBoxData) => {
    updateBoxMutation.mutate({ hiveId: id, boxId: updatedBoxData._id, boxData: updatedBoxData });
  };

  const handleDeleteBox = (boxId) => {
    deleteBoxMutation.mutate({ hiveId: id, boxId });
  };

  const handleRefetchInspections = () => {
    refetchInspections();
  };

  const boxCount = hive.children?.length ?? 0;

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
            {hive.children?.map((box, index) => (
              <li key={box._id || index} className="mb-1">
                Box {box.boxNumber}: {box.type} ({box.frames} frames)
                <Button
                  className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                  onClick={() => {
                    setSelectedBox(box);
                    setIsBoxModalOpen(true);
                  }}
                  aria-label={`Edit box ${box.boxNumber}`}
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
          aria-label="Add new box"
        >
          Add Box
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Recent Inspections</h2>
          <Button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleRefetchInspections}
            aria-label="Refresh inspections"
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
          <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" aria-label="Add new inspection">
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
