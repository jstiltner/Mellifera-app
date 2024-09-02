import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useHives, useUpdateHivePosition } from '../hooks/useHives';

const Apiary = ({ apiaryId }) => {
  const { data: hives, isLoading, error } = useHives(apiaryId);
  const updateHivePositionMutation = useUpdateHivePosition();

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (Array.isArray(hives) && hives.length > 0) {
      const maxRow = Math.max(...hives.map((hive) => hive.position?.row ?? 0));
      const newRows = Array.from({ length: maxRow + 1 }, (_, i) =>
        hives
          .filter((hive) => hive.position?.row === i)
          .sort((a, b) => (a.position?.orderNumber ?? 0) - (b.position?.orderNumber ?? 0))
      );
      setRows(newRows);
    }
  }, [hives]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      // Reorder within the same row
      const newRow = Array.from(rows[source.droppableId]);
      const [reorderedItem] = newRow.splice(source.index, 1);
      newRow.splice(destination.index, 0, reorderedItem);

      const newRows = [...rows];
      newRows[source.droppableId] = newRow;
      setRows(newRows);

      // Update positions
      newRow.forEach((hive, index) => {
        updateHivePositionMutation.mutate({
          hiveId: hive._id,
          position: { row: parseInt(source.droppableId), orderNumber: index },
        });
      });
    } else {
      // Move between rows
      const sourceRow = Array.from(rows[source.droppableId]);
      const destRow = Array.from(rows[destination.droppableId]);
      const [movedItem] = sourceRow.splice(source.index, 1);
      destRow.splice(destination.index, 0, movedItem);

      const newRows = [...rows];
      newRows[source.droppableId] = sourceRow;
      newRows[destination.droppableId] = destRow;
      setRows(newRows);

      // Update positions
      updateHivePositionMutation.mutate({
        hiveId: movedItem._id,
        position: { row: parseInt(destination.droppableId), orderNumber: destination.index },
      });
      destRow.forEach((hive, index) => {
        if (hive._id !== movedItem._id) {
          updateHivePositionMutation.mutate({
            hiveId: hive._id,
            position: { row: parseInt(destination.droppableId), orderNumber: index },
          });
        }
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {rows.map((row, rowIndex) => (
        <Droppable key={rowIndex} droppableId={`${rowIndex}`} direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ display: 'flex', marginBottom: '10px' }}
            >
              {row.map((hive, index) => (
                <Draggable key={hive._id} draggableId={hive._id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: 'none',
                        padding: 16,
                        margin: '0 8px 0 0',
                        minHeight: '50px',
                        backgroundColor: 'white',
                        color: 'black',
                        ...provided.draggableProps.style,
                      }}
                    >
                      {hive.name}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};

export default Apiary;
