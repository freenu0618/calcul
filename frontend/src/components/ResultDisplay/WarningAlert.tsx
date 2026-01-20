/**
 * 경고 메시지 컴포넌트
 * 최저임금 미달, 주 52시간 위반 등 경고 표시
 */

interface WarningAlertProps {
    warnings: string[];
}

export default function WarningAlert({ warnings }: WarningAlertProps) {
    if (warnings.length === 0) return null;

    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex items-start">
                <span className="text-yellow-400 text-xl mr-3">⚠️</span>
                <div>
                    <h4 className="text-yellow-800 font-semibold mb-1">주의</h4>
                    <ul className="text-yellow-700 text-sm space-y-1">
                        {warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
