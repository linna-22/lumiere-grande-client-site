import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('user_id');
        const error = searchParams.get('error');

        if (error) {
            console.error('Social login error:', error);
            navigate('/login');
            return;
        }

        if (token) {
            localStorage.setItem('access_token', token);
        }

        if (userId) {
            localStorage.setItem('user_id', userId);
        }

        if (token) {
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Signing you in...</p>
        </div>
    );
};

export default AuthCallback;