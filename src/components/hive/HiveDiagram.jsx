import PropTypes from 'prop-types';

const HiveBox = ({ boxData }) => {
  const boxType = boxData.boxNumber || boxData.name || 'Unknown';
  return (
    <div className="bg-yellow-100 border border-yellow-300 rounded my-0 text-sm flex flex-col">
      <div className="text-xl font-bold text-center">{boxData.boxNumber}</div>
      <div className="text-sm">{boxData.frames || 0} frames</div>
    </div>
  );
};

HiveBox.propTypes = {
  boxData: PropTypes.shape({
    type: PropTypes.string,
    name: PropTypes.string,
    boxNumber: PropTypes.number,
    frames: PropTypes.number,
  }).isRequired,
};

const Hive = ({ hiveData }) => {
  console.log('Rendering Hive:', hiveData);
  return (
    <div className="bg-yellow-200 border-2 border-yellow-600 rounded p-2 m-2 text-center w-48">
      <div className="font-bold text-lg mb-2">{hiveData.name || `Hive ${hiveData._id}`}</div>
      {/* <div className="text-sm mb-2">Boxes: {hiveData.children?.length || 0}</div> */}
      {hiveData.children?.map((box, index) => <HiveBox key={index} boxData={box} />) || (
        <div className="text-red-500">No boxes data available</div>
      )}
    </div>
  );
};

Hive.propTypes = {
  hiveData: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    children: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        name: PropTypes.string,
        frames: PropTypes.number,
      })
    ),
  }).isRequired,
};

const HiveStand = ({ hives }) => (
  <div className="flex flex-wrap justify-center items-start bg-brown-200 p-4 rounded-lg">
    {hives.map((hive) => (
      <Hive key={hive._id} hiveData={hive} />
    ))}
  </div>
);

HiveStand.propTypes = {
  hives: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string,
          name: PropTypes.string,
          frames: PropTypes.number,
        })
      ),
    })
  ).isRequired,
};

const HiveDiagram = ({ data }) => {
  console.log('HiveDiagram: Received data', data);

  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('HiveDiagram: Invalid or empty data');
    return <div className="text-red-500 p-4">No valid hive data available</div>;
  }

  return (
    <div className="bg-green-100 p-4 rounded-lg overflow-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Field Map</h2>
      <HiveStand hives={data} />
    </div>
  );
};

HiveDiagram.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string,
          name: PropTypes.string,
          frames: PropTypes.number,
        })
      ),
    })
  ).isRequired,
};

export default HiveDiagram;
