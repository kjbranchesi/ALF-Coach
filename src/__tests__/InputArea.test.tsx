import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { InputArea } from '../components/chat/InputArea';

describe('InputArea', () => {
  it('sends on Enter and not on Shift+Enter', () => {
    const onSend = jest.fn();
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <InputArea
        value={'Hello'}
        onChange={onChange}
        onSend={onSend}
        onToggleIdeas={() => {}}
        inputRef={{ current: null } as any}
      />
    );
    const textarea = getByLabelText('Chat message input');
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSend).toHaveBeenCalled();
    onSend.mockClear();
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('calls onEscape when pressing Esc', () => {
    const onEscape = jest.fn();
    const { getByLabelText } = render(
      <InputArea
        value={''}
        onChange={() => {}}
        onSend={() => {}}
        onToggleIdeas={() => {}}
        onEscape={onEscape}
        inputRef={{ current: null } as any}
      />
    );
    const textarea = getByLabelText('Chat message input');
    fireEvent.keyDown(textarea, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalled();
  });

  it('recalls last user message on ArrowUp when empty', () => {
    const onChange = jest.fn();
    const inputRef = { current: document.createElement('textarea') } as any;
    const { getByLabelText } = render(
      <InputArea
        value={''}
        onChange={onChange}
        onSend={() => {}}
        onToggleIdeas={() => {}}
        inputRef={inputRef}
        lastUserMessage={'Last message'}
      />
    );
    const textarea = getByLabelText('Chat message input');
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith('Last message');
  });
});

