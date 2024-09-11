import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/common/Button';
import BoxForm from '../components/hive/BoxForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useInspections } from '../hooks/useInspections';
import { useTreatments } from '../hooks/useTreatments';
import { errorToast, successToast } from '../utils/errorHandling';
import { fetchHive, addBox, updateBox, deleteBox, updateHive } from '../api/hiveApi';
import ErrorBoundary from '../components/common/ErrorBoundary';
import VoiceCommander from '../components/voice/VoiceCommander';
import TreatmentView from '../components/treatments/TreatmentView';

// ... (keep the HiveDetail and InspectionDetail components as they are)

const HiveDetails = () => {
  const { id } = useParams();
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHive, setEditedHive] = useState({});
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: hive,
    isLoading: isHiveLoading,
    isError: isHiveError,
    error: hiveError,
  } = useQuery({
    queryKey: ['hive', id],
    queryFn: () => fetchHive(id),
    enabled: !!id,
  });

  const {
    data: inspections,
    isLoading: isInspectionsLoading,
    isError: isInspectionsError,
    error: inspectionsError,
    refetch: refetchInspections,
  } = useInspections({ hiveId: id });

  const {
    getTreatmentsByHive,
    updateTreatment,
    deleteTreatment,
  } = useTreatments();

  const {
    data: treatments,
    isLoading: isTreatmentsLoading,
    isError: isTreatmentsError,
    error: treatmentsError,
  } = getTreatmentsByHive(id);

  // ... (keep the existing mutations as they are)

  const handleUpdateTreatment = useCallback(async (updatedTreatment) => {
    try {
      await updateTreatment.mutateAsync(updatedTreatment);
      setSelectedTreatment(null);
      successToast('Treatment updated successfully');
    } catch (error) {
      errorToast(error, 'Error updating treatment');
    }
  }, [updateTreatment]);

  const handleDeleteTreatment = useCallback(async (treatmentId) => {
    try {
      await deleteTreatment.mutateAsync(treatmentId);
      setSelectedTreatment(null);
      successToast('Treatment deleted successfully');
    } catch (error) {
      errorToast(error, 'Error deleting treatment');
    }
  }, [deleteTreatment]);

  // ... (keep the rest of the existing handlers as they are)

  if (!id) {
    return <div className="text-red-500 text-center py-4">Invalid Hive ID</div>;
  }

  if (isHiveLoading || isInspectionsLoading || isTreatmentsLoading) {
    return <LoadingSpinner />;
  }

  if (isHiveError || isInspectionsError || isTreatmentsError) {
    return (
      <div className="text-red-500 text-center py-4" aria-live="assertive">
        Error: {(hiveError || inspectionsError || treatmentsError)?.message || 'An error occurred while fetching data. Please try again later.'}
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

  const boxCount = hive.children?.length ?? 0;

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        {/* ... (keep the existing hive details section as it is) */}

        {!isEditing && (
          <>
            {/* ... (keep the existing boxes section as it is) */}

            <ErrorBoundary>
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Treatment History</h2>
                  <Link to={`/hives/${id}/add-treatment`}>
                    <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" aria-label="Add new treatment">
                      Add Treatment
                    </Button>
                  </Link>
                </div>
                {Array.isArray(treatments) && treatments.length > 0 ? (
                  <div>
                    {treatments.map((treatment) => (
                      <div key={treatment._id} className="mb-4 p-4 bg-gray-100 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">
                          Treatment on {new Date(treatment.date).toLocaleDateString()}
                        </h3>
                        <p><strong>Type:</strong> {treatment.type}</p>
                        <p><strong>Dose:</strong> {treatment.dose}</p>
                        <p><strong>Weather Conditions:</strong> {treatment.weatherConditions}</p>
                        <Button
                          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                          onClick={() => setSelectedTreatment(treatment)}
                        >
                          View/Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mb-4">No treatments recorded.</p>
                )}
              </div>
            </ErrorBoundary>

            {/* ... (keep the existing inspections section as it is) */}

            <Modal isOpen={isBoxModalOpen} onClose={() => {
              setIsBoxModalOpen(false);
              setSelectedBox(null);
            }}>
              <BoxForm
                initialBox={selectedBox}
                onAddBox={handleAddBox}
                onUpdateBox={handleUpdateBox}
                onDeleteBox={handleDeleteBox}
                closeModal={setIsBoxModalOpen}
              />
            </Modal>

            <Modal isOpen={!!selectedTreatment} onClose={() => setSelectedTreatment(null)}>
              <TreatmentView
                treatment={selectedTreatment}
                onClose={() => setSelectedTreatment(null)}
                onUpdate={handleUpdateTreatment}
                onDelete={handleDeleteTreatment}
              />
            </Modal>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default HiveDetails;
