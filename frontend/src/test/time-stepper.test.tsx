import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TimeStepper from '../components/common/TimeStepper';

function ControlledStepper({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  return <TimeStepper value={value} onChange={setValue} label="출근" />;
}

describe('TimeStepper', () => {
  it('distinguishes start and end controls by purpose and unit', () => {
    render(<>
      <TimeStepper value="09:00" onChange={() => {}} label="출근" />
      <TimeStepper value="18:00" onChange={() => {}} label="퇴근" />
    </>);
    for (const label of ['출근', '퇴근']) {
      const group = within(screen.getByRole('group', { name: label }));
      for (const action of ['1시간 줄이기', '1시간 늘리기', '10분 줄이기', '10분 늘리기']) {
        expect(group.getByRole('button', { name: `${label} ${action}` })).toBeInTheDocument();
      }
    }
  });

  it('supports keyboard adjustment across midnight and announces the current time', async () => {
    const user = userEvent.setup();
    render(<ControlledStepper initialValue="23:50" />);
    screen.getByRole('button', { name: '출근 10분 늘리기' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('출근 0시 0분');
    await user.click(screen.getByRole('button', { name: '출근 10분 줄이기' }));
    expect(screen.getByRole('status')).toHaveTextContent('출근 23시 50분');
    await user.click(screen.getByRole('button', { name: '출근 1시간 늘리기' }));
    expect(screen.getByRole('status')).toHaveTextContent('출근 0시 50분');
  });

  it('uses updated parent values immediately without emitting an extra change', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<TimeStepper value="09:00" onChange={onChange} />);
    rerender(<TimeStepper value="18:30" onChange={onChange} />);
    expect(screen.getByRole('status')).toHaveTextContent('시간 18시 30분');
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '시간 1시간 줄이기' }));
    expect(onChange).toHaveBeenCalledWith('17:30');
  });
});
