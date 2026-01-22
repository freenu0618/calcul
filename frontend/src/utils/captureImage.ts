/**
 * 결과 영역 이미지 캡처 유틸리티
 */

import html2canvas from 'html2canvas';

interface CaptureOptions {
  filename?: string;
  backgroundColor?: string;
  scale?: number;
}

/**
 * DOM 요소를 캡처하여 이미지로 다운로드
 */
export async function captureAndDownload(
  element: HTMLElement,
  options: CaptureOptions = {}
): Promise<void> {
  const {
    filename = '급여계산결과',
    backgroundColor = '#ffffff',
    scale = 2, // 고해상도
  } = options;

  const canvas = await html2canvas(element, {
    backgroundColor,
    scale,
    useCORS: true,
    logging: false,
  });

  // Blob 생성 및 다운로드
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/**
 * DOM 요소를 캡처하여 Blob 반환 (공유용)
 */
export async function captureToBlob(
  element: HTMLElement,
  options: CaptureOptions = {}
): Promise<Blob | null> {
  const { backgroundColor = '#ffffff', scale = 2 } = options;

  const canvas = await html2canvas(element, {
    backgroundColor,
    scale,
    useCORS: true,
    logging: false,
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

/**
 * Web Share API로 이미지 공유 (모바일 지원)
 */
export async function shareImage(
  element: HTMLElement,
  title: string,
  text: string
): Promise<boolean> {
  // Web Share API 지원 확인
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  const blob = await captureToBlob(element);
  if (!blob) return false;

  const file = new File([blob], '급여계산결과.png', { type: 'image/png' });

  // canShare 확인
  if (!navigator.canShare({ files: [file] })) {
    return false;
  }

  try {
    await navigator.share({
      title,
      text,
      files: [file],
    });
    return true;
  } catch {
    return false;
  }
}
