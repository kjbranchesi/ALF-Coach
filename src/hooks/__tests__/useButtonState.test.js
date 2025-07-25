import { renderHook, act } from '@testing-library/react';
import { useButtonState } from '../useButtonState';
import ButtonStateManager from '../../services/button-state-manager';

// Mock ButtonStateManager
jest.mock('../../services/button-state-manager');

describe('useButtonState', () => {
  let mockButtonStateManager;

  beforeEach(() => {
    // Create mock instance
    mockButtonStateManager = {
      getCurrentState: jest.fn().mockReturnValue({
        context: { stage: 'TEST_STAGE' },
        buttons: [
          { id: 'btn1', label: 'Button 1', action: 'action1', visible: true, enabled: true },
          { id: 'btn2', label: 'Button 2', action: 'action2', visible: true, enabled: true }
        ],
        timestamp: Date.now()
      }),
      subscribe: jest.fn().mockReturnValue(() => {}),
      processEvent: jest.fn().mockResolvedValue({}),
      getButtonsForContext: jest.fn().mockReturnValue([]),
      setButtonsLoading: jest.fn()
    };

    (ButtonStateManager.getInstance as jest.Mock).mockReturnValue(mockButtonStateManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with current state', () => {
    const { result } = renderHook(() => useButtonState());

    expect(result.current.state).toEqual({
      context: { stage: 'TEST_STAGE' },
      buttons: expect.arrayContaining([
        expect.objectContaining({ id: 'btn1', label: 'Button 1' })
      ]),
      timestamp: expect.any(Number)
    });

    expect(result.current.buttons).toHaveLength(2);
  });

  it('should subscribe to state changes on mount', () => {
    renderHook(() => useButtonState());

    expect(mockButtonStateManager.subscribe).toHaveBeenCalled();
  });

  it('should unsubscribe on unmount', () => {
    const unsubscribe = jest.fn();
    mockButtonStateManager.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useButtonState());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should dispatch events and update loading state', async () => {
    const { result } = renderHook(() => useButtonState());

    const event = {
      type: 'BUTTON_ACTION',
      payload: { action: 'test' }
    };

    await act(async () => {
      await result.current.dispatchEvent(event);
    });

    expect(mockButtonStateManager.setButtonsLoading).toHaveBeenCalledWith(true);
    expect(mockButtonStateManager.processEvent).toHaveBeenCalledWith(event);
    expect(mockButtonStateManager.setButtonsLoading).toHaveBeenCalledWith(false);
  });

  it('should handle dispatch event errors', async () => {
    mockButtonStateManager.processEvent.mockRejectedValue(new Error('Test error'));

    const { result } = renderHook(() => useButtonState());

    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    await act(async () => {
      await result.current.dispatchEvent({ type: 'TEST' });
    });

    expect(consoleError).toHaveBeenCalledWith('Failed to dispatch event:', expect.any(Error));
    expect(mockButtonStateManager.setButtonsLoading).toHaveBeenCalledWith(false);

    consoleError.mockRestore();
  });

  it('should get buttons for context', () => {
    const mockButtons = [
      { id: 'ctx-btn', label: 'Context Button', action: 'action', visible: true, enabled: true }
    ];
    mockButtonStateManager.getButtonsForContext.mockReturnValue(mockButtons);

    const { result } = renderHook(() => useButtonState());

    const context = {
      stage: 'CUSTOM_STAGE',
      phase: 'ACTIVE'
    };

    const buttons = result.current.getButtonsForContext(context);

    expect(mockButtonStateManager.getButtonsForContext).toHaveBeenCalledWith(context);
    expect(buttons).toEqual(mockButtons);
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useButtonState());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
    expect(mockButtonStateManager.setButtonsLoading).toHaveBeenCalledWith(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockButtonStateManager.setButtonsLoading).toHaveBeenCalledWith(false);
  });

  it('should update state when manager emits changes', () => {
    let capturedCallback: any;
    mockButtonStateManager.subscribe.mockImplementation((callback: any) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useButtonState());

    const newState = {
      context: { stage: 'NEW_STAGE' },
      buttons: [
        { id: 'new-btn', label: 'New Button', action: 'new', visible: true, enabled: true }
      ],
      timestamp: Date.now()
    };

    act(() => {
      capturedCallback(newState);
    });

    expect(result.current.state).toEqual(newState);
    expect(result.current.buttons).toEqual(newState.buttons);
  });

  it('should memoize buttons from state', () => {
    const { result, rerender } = renderHook(() => useButtonState());

    const initialButtons = result.current.buttons;

    // Rerender without state change
    rerender();

    expect(result.current.buttons).toBe(initialButtons);
  });
});