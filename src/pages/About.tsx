
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';

const About = () => {
  return (
    <Layout className="py-16 md:py-24">
      <motion.div 
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">关于博客</h1>
          <p className="text-xl text-muted-foreground">
            分享思想，连接世界
          </p>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p>
            欢迎来到我的博客空间。这是一个分享想法、探索新概念并与志同道合的读者建立联系的地方。这个博客专注于科技、设计和数字创新的交叉领域，旨在提供深入的分析和实用的见解。
          </p>
          
          <h2>我们的理念</h2>
          <p>
            我们相信简约而有力的内容。每篇文章都经过精心研究和编写，目的是提供真正的价值，而不仅仅是填充页面。无论是探讨新兴技术趋势，分享设计技巧，还是反思数字世界的发展，我们都致力于提供有思想深度的内容。
          </p>
          
          <h2>内容方向</h2>
          <ul>
            <li><strong>设计思考</strong> - 探索设计原则及其在数字产品中的应用</li>
            <li><strong>技术趋势</strong> - 分析新兴技术及其潜在影响</li>
            <li><strong>数字创新</strong> - 展示创新项目和解决方案</li>
            <li><strong>工作方法</strong> - 分享提高效率和创造力的实用技巧</li>
          </ul>
          
          <h2>联系方式</h2>
          <p>
            我们欢迎反馈、问题和合作提议。如果您对某个特定主题有兴趣，或者希望就已发布的内容进行讨论，请随时联系。
          </p>
          
          <div className="not-prose mt-8 flex flex-col sm:flex-row gap-4">
            <a 
              href="#" 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-center transition-all hover:bg-primary/90"
            >
              发送邮件
            </a>
            <a 
              href="#" 
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg text-center transition-all hover:bg-secondary/80"
            >
              关注社交媒体
            </a>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default About;
