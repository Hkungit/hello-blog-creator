
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Github, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Provider } from '@supabase/supabase-js';

const Auth = () => {
  const { user, loading, signIn, signUp, signInWithSocialProvider } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 如果用户已登录，重定向到首页
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signUp(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: Provider) => {
    await signInWithSocialProvider(provider);
  };

  const SocialButton = ({ provider, icon, label }: { provider: Provider; icon: React.ReactNode; label: string }) => (
    <Button 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2" 
      onClick={() => handleSocialLogin(provider)}
      disabled={isSubmitting || loading}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );

  return (
    <Layout className="flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg border"
      >
        <div className="text-center mb-8">
          <User className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-2xl font-bold">欢迎来到博客空间</h1>
          <p className="text-muted-foreground mt-2">登录或注册以继续</p>
        </div>

        <div className="space-y-4 mb-6">
          <SocialButton 
            provider="github" 
            icon={<Github className="h-4 w-4" />} 
            label="使用 GitHub 登录" 
          />
          <SocialButton 
            provider="discord" 
            icon={<MessageSquare className="h-4 w-4" />} 
            label="使用 Discord 登录" 
          />
          <SocialButton 
            provider="azure" 
            icon={
              <svg className="h-4 w-4" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h23v23H0z" fill="none"/>
                <path d="M21 11.5c0 5.2-4.3 9.5-9.5 9.5S2 16.7 2 11.5 6.3 2 11.5 2 21 6.3 21 11.5z" fill="currentColor"/>
              </svg>
            } 
            label="使用 Azure 登录" 
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-2 text-xs text-muted-foreground">或者使用邮箱</span>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="电子邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                {isSubmitting ? '登录中...' : '登录'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="电子邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="密码 (至少6位)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                {isSubmitting ? '注册中...' : '注册'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default Auth;
