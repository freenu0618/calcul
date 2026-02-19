/**
 * 공통 페이지 로딩 스피너
 */

interface PageLoaderProps {
  text?: string;
  minHeight?: string;
}

export default function PageLoader({ text = '불러오는 중...', minHeight = 'min-h-[400px]' }: PageLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-primary-500 mb-3" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
