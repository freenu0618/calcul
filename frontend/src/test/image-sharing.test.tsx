import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import html2canvas from 'html2canvas';
import { captureAndDownload, shareImage } from '../utils/captureImage';
import { ShareButtons } from '../components/common/ShareButtons';

vi.mock('html2canvas', () => ({ default: vi.fn() }));

const blob = new Blob(['image'], { type: 'image/png' });
let encode: BlobCallback;
const nativeShare = vi.fn();
const canShare = vi.fn();
const createObjectURL = vi.fn();
const revokeObjectURL = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  nativeShare.mockResolvedValue(undefined);
  canShare.mockReturnValue(true);
  createObjectURL.mockReturnValue('blob:test');
  vi.stubGlobal('navigator', { share: nativeShare, canShare });
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = createObjectURL;
    static revokeObjectURL = revokeObjectURL;
  });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  vi.mocked(html2canvas).mockResolvedValue({
    toBlob: (callback: BlobCallback) => { encode = callback; },
  } as HTMLCanvasElement);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function completeEncoding(value: Blob | null = blob) {
  await waitFor(() => expect(html2canvas).toHaveBeenCalledOnce());
  encode(value);
}

function renderShareButtons() {
  render(<>
    <div id="result">계산 결과</div>
    <ShareButtons url="https://paytools.work" title="급여 결과" captureTargetId="result" />
  </>);
}

describe('image download completion', () => {
  it('waits for image encoding before resolving or starting a download', async () => {
    let finished = false;
    const pending = captureAndDownload(document.createElement('div')).then(() => { finished = true; });
    await waitFor(() => expect(html2canvas).toHaveBeenCalledOnce());
    expect(finished).toBe(false);
    expect(createObjectURL).not.toHaveBeenCalled();
    encode(blob);
    await pending;
    expect(finished).toBe(true);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });

  it('rejects failed encoding instead of claiming a successful download', async () => {
    const assertion = expect(captureAndDownload(document.createElement('div'))).rejects.toThrow('이미지 생성에 실패했습니다');
    await completeEncoding(null);
    await assertion;
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});

describe('native image sharing', () => {
  it('returns false without capturing when sharing is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    await expect(shareImage(document.createElement('div'), 'title', '')).resolves.toBe(false);
    expect(html2canvas).not.toHaveBeenCalled();
  });

  it('reports a successful native share without downloading', async () => {
    const pending = shareImage(document.createElement('div'), 'title', 'description');
    await completeEncoding();
    await expect(pending).resolves.toBe(true);
    expect(nativeShare).toHaveBeenCalledWith({ title: 'title', text: 'description', files: [expect.any(File)] });
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('silently cancels without a fallback download or failure toast', async () => {
    nativeShare.mockRejectedValue(new DOMException('Cancelled', 'AbortError'));
    renderShareButtons();
    fireEvent.click(screen.getByRole('button', { name: '이미지로 공유' }));
    await completeEncoding();
    await waitFor(() => expect(screen.getByRole('button', { name: '이미지로 공유' })).toBeEnabled());
    expect(nativeShare).toHaveBeenCalledOnce();
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(screen.queryByText('공유에 실패했습니다')).not.toBeInTheDocument();
    expect(screen.queryByText('이미지가 저장되었습니다')).not.toBeInTheDocument();
  });

  it('reports real sharing errors without starting an unsolicited download', async () => {
    nativeShare.mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    renderShareButtons();
    fireEvent.click(screen.getByRole('button', { name: '이미지로 공유' }));
    await completeEncoding();
    expect(await screen.findByText('공유에 실패했습니다')).toBeInTheDocument();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('keeps the download fallback when native sharing is unsupported', async () => {
    vi.stubGlobal('navigator', {});
    renderShareButtons();
    fireEvent.click(screen.getByRole('button', { name: '이미지로 공유' }));
    await completeEncoding();
    expect(await screen.findByText('이미지가 저장되었습니다')).toBeInTheDocument();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
  });
});
