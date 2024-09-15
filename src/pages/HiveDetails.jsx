import { useState, useCallback } from 'react';
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
import Menu from '../components/layout/Menu';
import BoxList from './BoxList';
import Button from '../components/common/Button';
import VoiceControl from '../components/voice/VoiceControl';

const HiveDetails = () => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedHive, setEditedHive] = useState({});
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

  if (isHiveLoading) {
    return <LoadingSpinner />;
  }

  if (isHiveError) {
    return (
      <div className="text-red-500 text-center py-4" aria-live="assertive">
        Error:{' '}
        {hiveError?.message || 'An error occurred while fetching data. Please try again later.'}
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
                <Link to={`/apiaries/${hive.apiaryId}`}>
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
              <FeedingSection hiveId={id} />
              <InspectionSection hiveId={id} />
              <TreatmentSection hiveId={id} />
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default HiveDetails;
