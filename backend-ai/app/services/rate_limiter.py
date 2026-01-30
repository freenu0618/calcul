"""
Rate Limiter 서비스
사용자별 요청 제한 관리
"""

import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional

from app.core.config import get_settings

settings = get_settings()


@dataclass
class UserRateLimit:
    """사용자별 Rate Limit 상태"""
    requests: list = field(default_factory=list)
    tier: str = "free"  # "free" or "pro"

    def get_limit(self) -> int:
        if self.tier == "pro":
            return settings.pro_tier_requests_per_hour
        return settings.free_tier_requests_per_hour

    def can_request(self) -> tuple[bool, int]:
        """
        요청 가능 여부 및 남은 요청 수 반환

        Returns:
            (can_request, remaining_requests)
        """
        now = time.time()
        hour_ago = now - 3600

        # 1시간 이내 요청만 유지
        self.requests = [t for t in self.requests if t > hour_ago]

        limit = self.get_limit()
        remaining = limit - len(self.requests)

        return remaining > 0, max(0, remaining)

    def record_request(self):
        """요청 기록"""
        self.requests.append(time.time())


class RateLimiter:
    """전역 Rate Limiter"""

    def __init__(self):
        self.users: dict[str, UserRateLimit] = defaultdict(UserRateLimit)

    def check_limit(self, user_id: str, tier: str = "free") -> tuple[bool, int, int]:
        """
        Rate limit 체크

        Args:
            user_id: 사용자 ID
            tier: 요금제 ("free" or "pro")

        Returns:
            (allowed, remaining, reset_seconds)
        """
        user_limit = self.users[user_id]
        user_limit.tier = tier

        can_request, remaining = user_limit.can_request()

        # Reset time 계산 (가장 오래된 요청 + 1시간)
        reset_seconds = 0
        if not can_request and user_limit.requests:
            oldest = min(user_limit.requests)
            reset_seconds = int(oldest + 3600 - time.time())

        return can_request, remaining, reset_seconds

    def record_request(self, user_id: str):
        """요청 기록"""
        self.users[user_id].record_request()

    def get_usage(self, user_id: str) -> dict:
        """사용량 조회"""
        user_limit = self.users[user_id]
        _, remaining = user_limit.can_request()
        limit = user_limit.get_limit()

        return {
            "user_id": user_id,
            "tier": user_limit.tier,
            "used": limit - remaining,
            "limit": limit,
            "remaining": remaining,
        }


# 싱글톤 인스턴스
_rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter() -> RateLimiter:
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter()
    return _rate_limiter
