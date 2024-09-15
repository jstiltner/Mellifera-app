import PropTypes from 'prop-types';

const ReusableList = ({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items found',
  className = '',
}) => {
  if (!items || items.length === 0) {
    return <p className="text-gray-500 text-center py-4">{emptyMessage}</p>;
  }

  return (
    <ul className={`divide-y divide-gray-200 ${className}`}>
      {items.map((item) => (
        <li key={keyExtractor(item)} className="py-4">
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
};

ReusableList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any),
  renderItem: PropTypes.func.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
};

export default ReusableList;
