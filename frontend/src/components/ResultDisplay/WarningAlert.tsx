/**
 * 경고 메시지 컴포넌트
 * 최저임금 미달, 주 52시간 위반 등 경고를 수준별로 표시
 */
import { useState } from 'react';
import type { WarningItem } from '../../types/salary';

interface WarningAlertProps {
    warnings: WarningItem[];
}

const LEVEL_STYLES = {
    critical: {
        bg: 'bg-red-50',
        border: 'border-red-500',
        icon: '🚨',
        title: '위반 경고',
        titleColor: 'text-red-800',
        textColor: 'text-red-700',
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-400',
        icon: '⚠️',
        title: '주의',
        titleColor: 'text-yellow-800',
        textColor: 'text-yellow-700',
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-400',
        icon: 'ℹ️',
        title: '참고',
        titleColor: 'text-blue-800',
        textColor: 'text-blue-700',
    },
};

export default function WarningAlert({ warnings }: WarningAlertProps) {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    if (warnings.length === 0) return null;

    // 수준별 그룹화: critical → warning → info
    const sorted = [...warnings].sort((a, b) => {
        const order = { critical: 0, warning: 1, info: 2 };
        return order[a.level] - order[b.level];
    });

    return (
        <div className="space-y-2">
            {sorted.map((w, idx) => {
                const style = LEVEL_STYLES[w.level];
                const isExpanded = expandedIdx === idx;

                return (
                    <div
                        key={idx}
                        className={`${style.bg} border-l-4 ${style.border} p-3 rounded-r`}
                    >
                        <div
                            className="flex items-start cursor-pointer"
                            onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                        >
                            <span className="text-lg mr-2 flex-shrink-0">{style.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className={`${style.titleColor} font-semibold text-sm`}>
                                    [{style.title}] {w.message}
                                </p>
                                {isExpanded && w.detail && (
                                    <p className={`${style.textColor} text-xs mt-1`}>
                                        {w.detail}
                                    </p>
                                )}
                            </div>
                            {w.detail && (
                                <span className={`${style.textColor} text-xs ml-2 flex-shrink-0`}>
                                    {isExpanded ? '▲' : '▼'}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
