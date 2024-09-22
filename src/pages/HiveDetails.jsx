import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchHive, updateHive } from '../api/hiveApi';
import { errorToast, successToast } from '../utils/errorHandling';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import HiveInfoSection from '../components/hive/HiveInfoSection';
import TreatmentSection from '../components/hive/TreatmentSection';
import InspectionSection from '../components/hive/InspectionSection';
import FeedingSection from '../components/hive/FeedingSection';
import FeedingForm from '../components/hive/FeedingForm';
import Menu from '../components/layout/Menu';
import BoxList from './BoxList';
import Button from '../components/common/Button';
import VoiceControl from '../components/voice/VoiceControl';

const HiveDetails = () => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedHive, setEditedHive] = useState({});
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: hive,
    isLoading: isHiveLoading,
    isError: isHiveError,
    error: hiveError,
    refetch: refetchHive,
  } = useQuery({
    queryKey: ['hive', id],
    queryFn: () => fetchHive(id),
    enabled: !!id,
  });

  useEffect(() => {
    console.log('HiveDetails component mounted. ID:', id);
  }, [id]);

  useEffect(() => {
    if (hive) {
      console.log('Hive data received:', hive);
    }
  }, [hive]);

  const updateHiveMutation = useMutation({
    mutationFn: (updatedHive) => updateHive(id, updatedHive),
    onSuccess: () => {
      queryClient.invalidateQueries(['hive', id]);
      setIsEditing(false);
      successToast('Hive updated successfully');
      navigate(`/hives/${id}`);
    },
    onError: (error) => errorToast(error, 'Error updating hive'),
  });

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setEditedHive({ ...hive });
  }, [hive]);

  const handleSaveClick = useCallback(() => {
    updateHiveMutation.mutate(editedHive);
  }, [updateHiveMutation, editedHive]);

  const handleCancelClick = useCallback(() => {
    setIsEditing(false);
    setEditedHive({});
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setEditedHive((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleInspectionAdded = useCallback(() => {
    refetchHive();
  }, [refetchHive]);

  const handleFeedingAdded = useCallback(() => {
    refetchHive();
    setShowFeedingModal(false);
  }, [refetchHive]);

  if (isHiveLoading) {
    console.log('Hive data is loading...');
    return <LoadingSpinner />;
  }

  if (isHiveError) {
    console.error('Error fetching hive data:', hiveError);
    return (
      <div className="text-red-500 text-center py-4" aria-live="assertive">
        Error:{' '}
        {hiveError?.message || 'An error occurred while fetching data. Please try again later.'}
      </div>
    );
  }

  if (!hive) {
    console.warn('No hive data received');
    return (
      <div className="text-center py-4" aria-live="assertive">
        No hive found
      </div>
    );
  }

  console.log('Rendering HiveDetails component with data:', hive);

  return (
    <ErrorBoundary>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        <aside className="w-full md:w-64 bg-white shadow-md p-4 md:h-screen md:overflow-y-auto">
          <Menu />
        </aside>
        <main className="flex-grow p-4 md:overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <div className="flex items-center mb-4 sm:mb-0">
                <Link to={`/apiaries/${hive.parent?._id}`}>
                  <Button className="mr-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                    ← Back to Apiary
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-indigo-700">{hive.name}</h1>
              </div>
            </div>
            <div className="space-y-6">
              <HiveInfoSection
                hive={isEditing ? editedHive : hive}
                isEditing={isEditing}
                onEdit={handleEditClick}
                onSave={handleSaveClick}
                onCancel={handleCancelClick}
                onInputChange={handleInputChange}
              />
              <BoxList boxes={hive.children} hiveId={id} />
              <FeedingSection 
                hiveId={id} 
                feedings={hive.feedings} 
                onAddFeeding={() => setShowFeedingModal(true)} 
              />
              <InspectionSection 
                hiveId={id} 
                inspections={hive.inspections} 
                onInspectionAdded={handleInspectionAdded}
              />
              <TreatmentSection hiveId={id} />
            </div>
          </div>
        </main>
      </div>
      {showFeedingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Feeding</h2>
            <FeedingForm hiveId={id} onClose={() => setShowFeedingModal(false)} onFeedingAdded={handleFeedingAdded} />
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default HiveDetails;
