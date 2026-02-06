import { describe, it, expect } from 'vitest';

describe('테스트 환경 설정', () => {
  it('Vitest가 정상적으로 동작해야 함', () => {
    expect(true).toBe(true);
  });

  it('산술 연산이 정확해야 함', () => {
    expect(1 + 1).toBe(2);
  });
});
