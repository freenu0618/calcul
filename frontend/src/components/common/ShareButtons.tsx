/**
 * SNS 공유 버튼 컴포넌트
 */

import { useState, useCallback } from 'react';
import { captureAndDownload, shareImage } from '../../utils/captureImage';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  captureTargetId?: string; // 캡처할 요소의 ID
}

export function ShareButtons({ url, title, description, captureTargetId }: ShareButtonsProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 이미지 다운로드
  const handleDownloadImage = useCallback(async () => {
    if (!captureTargetId) return;
    const element = document.getElementById(captureTargetId);
    if (!element) return;

    setIsCapturing(true);
    try {
      await captureAndDownload(element, { filename: '급여계산결과' });
      showToastMessage('이미지가 저장되었습니다');

      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'share', {
          method: 'image_download',
          content_type: 'salary_result',
        });
      }
    } catch (err) {
      showToastMessage('이미지 저장에 실패했습니다');
    } finally {
      setIsCapturing(false);
    }
  }, [captureTargetId]);

  // 이미지 공유 (모바일)
  const handleShareImage = useCallback(async () => {
    if (!captureTargetId) return;
    const element = document.getElementById(captureTargetId);
    if (!element) return;

    setIsCapturing(true);
    try {
      const shared = await shareImage(element, title, description || '');
      if (shared) {
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'share', {
            method: 'native_share',
            content_type: 'salary_result',
          });
        }
      } else {
        // Web Share API 미지원 시 다운로드로 대체
        await captureAndDownload(element, { filename: '급여계산결과' });
        showToastMessage('이미지가 저장되었습니다');
      }
    } catch {
      showToastMessage('공유에 실패했습니다');
    } finally {
      setIsCapturing(false);
    }
  }, [captureTargetId, title, description]);

  const handleKakaoShare = () => {
    // KakaoTalk 공유 (Kakao SDK 필요)
    if (typeof window !== 'undefined' && (window as any).Kakao) {
      (window as any).Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description: description || '',
          imageUrl: 'https://paytools.work/og-image.svg',
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
      });
    } else {
      // Kakao SDK가 없으면 URL 복사로 대체
      handleCopyLink();
    }

    // GA4 이벤트 추적
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'share', {
        method: 'kakao',
        content_type: 'salary_result',
        item_id: url,
      });
    }
  };

  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');

    // GA4 이벤트 추적
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'share', {
        method: 'facebook',
        content_type: 'salary_result',
        item_id: url,
      });
    }
  };

  const handleTwitterShare = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');

    // GA4 이벤트 추적
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'share', {
        method: 'twitter',
        content_type: 'salary_result',
        item_id: url,
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToastMessage('링크가 복사되었습니다');

      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'share', {
          method: 'copy',
          content_type: 'salary_result',
          item_id: url,
        });
      }
    } catch {
      showToastMessage('복사에 실패했습니다');
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">이 결과 공유하기</h3>

      {/* 이미지 저장/공유 (최상단, 강조) */}
      {captureTargetId && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleDownloadImage}
            disabled={isCapturing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
            aria-label="이미지로 저장"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{isCapturing ? '처리 중...' : '이미지로 저장'}</span>
          </button>

          <button
            onClick={handleShareImage}
            disabled={isCapturing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
            aria-label="이미지로 공유"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>{isCapturing ? '처리 중...' : '이미지로 공유'}</span>
          </button>
        </div>
      )}

      {/* SNS 공유 버튼 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleKakaoShare}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg transition-colors"
          aria-label="카카오톡으로 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
          </svg>
          <span>카카오톡</span>
        </button>

        <button
          onClick={handleFacebookShare}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          aria-label="페이스북으로 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </button>

        <button
          onClick={handleTwitterShare}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
          aria-label="트위터로 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          <span>Twitter</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          aria-label="링크 복사"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>링크 복사</span>
        </button>
      </div>

      {/* Toast 알림 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
