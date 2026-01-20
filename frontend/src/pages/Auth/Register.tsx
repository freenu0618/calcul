/**
 * 회원가입 페이지
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // 비밀번호 확인
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 길이 검증
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, fullName);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>회원가입 | 급여 계산기</title>
        <meta name="description" content="급여 계산기에 가입하여 급여 이력을 저장하고 관리하세요. 무료로 시작하세요." />
      </Helmet>

      <MainLayout>
        <div className="max-w-md mx-auto mt-12">
          <Card title="회원가입">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Input
                label="이메일"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />

              <Input
                label="이름"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="홍길동"
                required
              />

              <Input
                label="비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="최소 8자 이상"
                required
              />

              <Input
                label="비밀번호 확인"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                  로그인
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </MainLayout>
    </>
  );
};

export default Register;
