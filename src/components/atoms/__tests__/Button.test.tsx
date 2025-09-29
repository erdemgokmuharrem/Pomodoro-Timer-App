import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render, mockTask } from '../../../utils/testUtils';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={jest.fn()} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    const { getByLabelText } = render(
      <Button title="Test Button" onPress={jest.fn()} loading={true} />
    );
    
    expect(getByLabelText('Yükleniyor')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('applies correct styles for different variants', () => {
    const { getByText: getPrimary } = render(
      <Button title="Primary" onPress={jest.fn()} variant="primary" />
    );
    
    const { getByText: getSecondary } = render(
      <Button title="Secondary" onPress={jest.fn()} variant="secondary" />
    );
    
    expect(getPrimary('Primary')).toBeTruthy();
    expect(getSecondary('Secondary')).toBeTruthy();
  });

  it('has correct accessibility properties', () => {
    const { getByLabelText } = render(
      <Button title="Accessible Button" onPress={jest.fn()} />
    );
    
    const button = getByLabelText('Accessible Button');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityHint).toBe('Dokunarak etkinleştir');
  });

  it('shows correct accessibility state when disabled', () => {
    const { getByLabelText } = render(
      <Button title="Disabled Button" onPress={jest.fn()} disabled={true} />
    );
    
    const button = getByLabelText('Disabled Button');
    expect(button.props.accessibilityState.disabled).toBe(true);
    expect(button.props.accessibilityHint).toBe('Bu buton şu anda devre dışı');
  });
});
