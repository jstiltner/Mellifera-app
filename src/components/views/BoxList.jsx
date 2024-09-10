import React from 'react';
import { Link } from 'react-router-dom';

const BoxList = ({ boxes, hiveId }) => {
  return (
    <div>
      <h2>Boxes for Hive {hiveId}</h2>
      <ul>
        {boxes.map((box) => (
          <li key={box._id}>
            <Link to={`/boxes/${box._id}`}>
              <h3>{box.name}</h3>
              <p>Type: {box.type}</p>
              <p>Description: {box.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoxList;
