import PropTypes from 'prop-types';
import Button from '../common/Button';
import HiveDetail from '../common/HiveDetail';

const HiveInfoSection = ({ hive, isEditing, onEdit, onSave, onCancel, onInputChange }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-md shadow col-span-1 md:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-indigo-600">Hive Information</h2>
        {isEditing ? (
          <div className="space-x-2">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              onClick={onSave}
            >
              Save
            </Button>
            <Button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HiveDetail
          label="Name"
          value={hive.name}
          isEditing={isEditing}
          onChange={(value) => onInputChange('name', value)}
        />
        <HiveDetail
          label="Type"
          value={hive.type}
          isEditing={isEditing}
          onChange={(value) => onInputChange('type', value)}
        />
        <HiveDetail
          label="Status"
          value={hive.status}
          isEditing={isEditing}
          onChange={(value) => onInputChange('status', value)}
        />
        <HiveDetail
          label="Queen Present"
          value={hive.queenPresent ? 'Yes' : 'No'}
          isEditing={isEditing}
          onChange={(value) => onInputChange('queenPresent', value === 'Yes')}
          inputType="select"
          options={['Yes', 'No']}
        />
        <HiveDetail label="Box Count" value={hive.children?.length ?? 0} isEditing={false} />
        <HiveDetail
          label="Last Inspection"
          value={hive.lastInspection ? new Date(hive.lastInspection).toLocaleDateString() : 'N/A'}
          isEditing={false}
        />
        <HiveDetail
          label="Last Treatment"
          value={hive.lastTreatment ? new Date(hive.lastTreatment).toLocaleDateString() : 'N/A'}
          isEditing={false}
        />
      </div>
    </div>
  );
};

HiveInfoSection.propTypes = {
  hive: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default HiveInfoSection;
