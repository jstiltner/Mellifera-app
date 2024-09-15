import React from 'react';
import { render, screen } from '@testing-library/react';
import ReusableList from '../../components/common/ReusableList';

describe('ReusableList', () => {
  const mockItems = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  const renderItem = (item) => <div>{item.name}</div>;
  const keyExtractor = (item) => item.id;

  it('renders list items correctly', () => {
    render(<ReusableList items={mockItems} renderItem={renderItem} keyExtractor={keyExtractor} />);

    mockItems.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  it('displays empty message when no items are provided', () => {
    const emptyMessage = 'No items available';
    render(
      <ReusableList
        items={[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        emptyMessage={emptyMessage}
      />
    );

    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClassName = 'custom-list-class';
    const { container } = render(
      <ReusableList
        items={mockItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        className={customClassName}
      />
    );

    expect(container.firstChild).toHaveClass(customClassName);
  });
});
