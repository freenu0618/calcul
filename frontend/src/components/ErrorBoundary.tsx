/**
 * 에러 바운더리 컴포넌트
 * React 에러를 캐치하여 사용자 친화적인 에러 페이지를 표시합니다.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import Card from './common/Card';
import Button from './common/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI가 표시되도록 상태를 업데이트합니다.
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅 서비스에 에러를 기록할 수 있습니다.
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Google Analytics에 에러 이벤트 전송
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: true,
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // 페이지 새로고침
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                문제가 발생했습니다
              </h1>
              <p className="text-gray-600 mb-6">
                예상치 못한 오류가 발생했습니다. 불편을 드려 죄송합니다.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                    개발자 정보 (프로덕션에서는 표시되지 않음)
                  </summary>
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-mono text-red-800 mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs text-red-700 overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-4 justify-center">
                <Button onClick={this.handleReset} variant="primary">
                  홈으로 돌아가기
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="secondary"
                >
                  페이지 새로고침
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  문제가 계속되면{' '}
                  <a
                    href="/contact"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    고객 지원팀
                  </a>
                  으로 문의해주세요.
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
