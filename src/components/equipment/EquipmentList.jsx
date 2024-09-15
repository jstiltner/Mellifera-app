import { useEquipment } from '../../hooks/useEquipment';
import { Button } from '../common';

const EquipmentList = ({ onEdit }) => {
  const { equipment, isLoading, error, deleteEquipment } = useEquipment();

  if (isLoading) return <div>Loading equipment...</div>;
  if (error) return <div>Error loading equipment: {error.message}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Type</th>
            <th className="py-3 px-6 text-center">Quantity</th>
            <th className="py-3 px-6 text-center">Condition</th>
            <th className="py-3 px-6 text-center">Last Used</th>
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {equipment.map((item) => (
            <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left whitespace-nowrap">{item.name}</td>
              <td className="py-3 px-6 text-left">{item.type}</td>
              <td className="py-3 px-6 text-center">{item.quantity}</td>
              <td className="py-3 px-6 text-center">{item.condition}</td>
              <td className="py-3 px-6 text-center">
                {item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : 'N/A'}
              </td>
              <td className="py-3 px-6 text-center">
                <div className="flex item-center justify-center">
                  <Button onClick={() => onEdit(item)} className="mr-2">
                    Edit
                  </Button>
                  <Button
                    onClick={() => deleteEquipment(item._id)}
                    className="bg-red-500 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentList;
