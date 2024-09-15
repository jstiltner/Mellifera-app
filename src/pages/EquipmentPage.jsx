import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEquipment } from '../hooks/useEquipment';
import EquipmentList from '../components/equipment/EquipmentList';
import EquipmentForm from '../components/equipment/EquipmentForm';
import { Button } from '../components/common';
import Modal from '../components/common/Modal';
import Menu from '../components/layout/Menu';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EquipmentPage = () => {
  const { getEquipment } = useEquipment();
  const {
    data: equipment,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['equipment'],
    queryFn: getEquipment,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setShowModal(true);
  };

  const handleEditEquipment = (equipment) => {
    setEditingEquipment(equipment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEquipment(null);
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  return (
    <div className="container mx-auto px-4">
      <Menu />
      <h1 className="text-2xl font-bold my-4">Equipment Management</h1>
      <Button onClick={handleAddEquipment} className="mb-4">
        Add New Equipment
      </Button>
      <EquipmentList equipment={equipment} onEdit={handleEditEquipment} />
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <EquipmentForm equipment={editingEquipment} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default EquipmentPage;
