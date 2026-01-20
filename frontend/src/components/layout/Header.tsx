/**
 * Header 레이아웃 컴포넌트
 */

export default function Header() {
  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">급여 계산기</h1>
            <span className="text-sm bg-primary-700 px-2 py-1 rounded">2026</span>
          </div>
          <nav className="flex items-center space-x-4">
            <a href="#" className="hover:text-primary-100 transition-colors">
              계산하기
            </a>
            <a href="#" className="hover:text-primary-100 transition-colors">
              법정 요율
            </a>
            <a href="#" className="hover:text-primary-100 transition-colors">
              사용 가이드
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
