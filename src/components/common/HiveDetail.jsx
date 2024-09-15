import PropTypes from 'prop-types';

const HiveDetail = ({ label, value, isEditing, onChange, inputType = 'text', options = [] }) => {
  const inputClassName =
    'w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out';
  const labelClassName = 'block text-sm font-medium text-gray-700 mb-1';
  const valueClassName = 'text-gray-900';

  const renderInput = () => {
    switch (inputType) {
      case 'select':
        return (
          <select
            value={value?.toString() ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClassName}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value?.toString() ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClassName}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value?.toString() ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClassName}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label className={labelClassName}>{label}</label>
      {isEditing ? (
        renderInput()
      ) : (
        <div className={valueClassName}>{value?.toString() ?? 'N/A'}</div>
      )}
    </div>
  );
};

HiveDetail.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  isEditing: PropTypes.bool.isRequired,
  onChange: PropTypes.func,
  inputType: PropTypes.oneOf(['text', 'number', 'select']),
  options: PropTypes.arrayOf(PropTypes.string),
};

export default HiveDetail;
