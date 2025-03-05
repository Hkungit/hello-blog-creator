
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting auth session:', error.message);
        setError('登录失败，请重试');
        setTimeout(() => navigate('/auth'), 2000);
        return;
      }
      
      // Redirect back to home page on successful authentication
      navigate('/');
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <Layout className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        {error ? (
          <div className="text-destructive text-lg">{error}</div>
        ) : (
          <>
            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">正在登录...</h2>
            <p className="text-muted-foreground">请稍候，我们正在处理您的登录请求</p>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AuthCallback;
