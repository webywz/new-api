/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Input,
  ScrollList,
  ScrollItem,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
  IconLayers,
  IconCreditCard,
  IconBolt,
  IconActivity,
  IconUser,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import {
  Moonshot,
  OpenAI,
  XAI,
  Zhipu,
  Volcengine,
  Cohere,
  Claude,
  Gemini,
  Suno,
  Minimax,
  Wenxin,
  Spark,
  Qingyan,
  DeepSeek,
  Qwen,
  Doubao,
  Midjourney,
  Grok,
  AzureAI,
  Hunyuan,
  Xinference,
} from '@lobehub/icons';

const { Text } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  return (
    <div className='min-h-screen w-full flex flex-col bg-slate-50 relative overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {/* 背景装饰 */}
      <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px] pointer-events-none' />
      <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[120px] pointer-events-none' />

      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full relative z-10'>
          <div className='w-full'>
            <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 mt-8'>
              <div className='grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center'>
                <div className='text-left'>
                  <div className='inline-flex items-center px-3 py-1 rounded-full bg-white border border-blue-100 shadow-sm mb-6 w-fit'>
                    <span className='w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse'></span>
                    <span className='text-xs font-medium text-blue-700 tracking-wide'>
                      {t('欢迎使用 众联世纪平台 API')}
                    </span>
                  </div>
                  <h1
                    className={`text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6 ${isChinese ? 'tracking-wide' : ''}`}
                  >
                    {t('统一的')} <br />
                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'>
                      {t('大模型接口网关')}
                    </span>
                  </h1>
                  <p className='text-lg md:text-xl text-slate-600 mt-6 max-w-2xl leading-relaxed'>
                    {t('只需将模型基址替换为统一入口，即可获得更好的价格、更稳定的服务与完善的风控管理。')}
                  </p>
                  
                  <div className='flex flex-col md:flex-row items-center gap-4 w-full mt-10 max-w-xl'>
                    <div className='flex-1 w-full relative group'>
                      <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur'></div>
                      <Input
                        readonly
                        value={serverAddress}
                        className='!rounded-xl border-0 bg-white shadow-sm relative'
                        size={isMobile ? 'default' : 'large'}
                        suffix={
                          <div className='flex items-center gap-2 pr-1'>
                            <div className='hidden sm:block'>
                              <ScrollList
                                bodyHeight={32}
                                style={{ border: 'unset', boxShadow: 'unset' }}
                              >
                                <ScrollItem
                                  mode='wheel'
                                  cycled={true}
                                  list={endpointItems}
                                  selectedIndex={endpointIndex}
                                  onSelect={({ index }) => setEndpointIndex(index)}
                                />
                              </ScrollList>
                            </div>
                            <Button
                              theme='borderless'
                              type='tertiary'
                              className='!text-slate-500 hover:!text-blue-600'
                              onClick={handleCopyBaseURL}
                              icon={<IconCopy />}
                            />
                          </div>
                        }
                      />
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-4 mt-8'>
                    <Link to='/console'>
                      <Button
                        theme='solid'
                        type='primary'
                        size='large'
                        className='!rounded-xl px-8 py-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 !text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 border-none'
                        icon={<IconPlay />}
                      >
                        {t('获取密钥')}
                      </Button>
                    </Link>

                  </div>
                </div>

                <div className='relative'>
                  <div className='absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[32px] opacity-10 blur-xl'></div>
                  <div className='relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500'>
                    <div className='flex items-center justify-between mb-8'>
                      <div>
                        <Text className='text-slate-900 font-bold text-xl block'>
                          {t('快速开始')}
                        </Text>
                        <Text className='text-slate-500 text-sm mt-1 block'>
                          {t('仅需三步即可接入')}
                        </Text>
                      </div>
                      <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600'>
                        <IconBolt size='large' />
                      </div>
                    </div>
                    
                    <div className='space-y-8 relative'>
                      <div className='absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 -z-10'></div>
                      
                      <div className='flex items-start gap-4 group'>
                        <div className='w-8 h-8 rounded-full bg-white border-2 border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300'>
                          1
                        </div>
                        <div className='pt-1'>
                          <Text className='text-slate-900 font-semibold block text-base group-hover:text-blue-600 transition-colors'>
                            {t('创建密钥')}
                          </Text>
                          <Text className='text-slate-500 text-sm mt-1 block leading-relaxed'>
                            {t('登录控制台，生成您的专属调用密钥 (sk-...)')}
                          </Text>
                        </div>
                      </div>
                      
                      <div className='flex items-start gap-4 group'>
                        <div className='w-8 h-8 rounded-full bg-white border-2 border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300'>
                          2
                        </div>
                        <div className='pt-1'>
                          <Text className='text-slate-900 font-semibold block text-base group-hover:text-blue-600 transition-colors'>
                            {t('配置基址')}
                          </Text>
                          <Text className='text-slate-500 text-sm mt-1 block leading-relaxed'>
                            {t('将 OpenAI SDK 或客户端的 Base URL 替换为上方地址')}
                          </Text>
                        </div>
                      </div>
                      
                      <div className='flex items-start gap-4 group'>
                        <div className='w-8 h-8 rounded-full bg-white border-2 border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300'>
                          3
                        </div>
                        <div className='pt-1'>
                          <Text className='text-slate-900 font-semibold block text-base group-hover:text-blue-600 transition-colors'>
                            {t('开始调用')}
                          </Text>
                          <Text className='text-slate-500 text-sm mt-1 block leading-relaxed'>
                            {t('无需修改代码，即可享受聚合模型服务')}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
                {t('核心能力')}
              </h2>
              <p className='text-lg text-slate-600 max-w-2xl mx-auto'>
                {t('为企业与开发者提供全方位的 AI 接口管理解决方案')}
              </p>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              <div className='group bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <IconLayers className='text-blue-600' size='extra-large' />
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors'>
                  {t('统一路由')}
                </h3>
                <p className='text-slate-500 leading-relaxed'>
                  {t('一个接口聚合 OpenAI、Claude、Gemini 等所有主流模型，无需维护多个 SDK 与配置。')}
                </p>
              </div>

              <div className='group bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <IconActivity className='text-indigo-600' size='extra-large' />
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors'>
                  {t('稳定高可用')}
                </h3>
                <p className='text-slate-500 leading-relaxed'>
                  {t('内置多级重试、熔断与负载均衡机制，确保高并发下的服务稳定性与成功率。')}
                </p>
              </div>

              <div className='group bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <IconCreditCard className='text-cyan-600' size='extra-large' />
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors'>
                  {t('成本控制')}
                </h3>
                <p className='text-slate-500 leading-relaxed'>
                  {t('精细化的额度管理与倍率设置，支持按用户、按模型设置消耗限制，避免意外超支。')}
                </p>
              </div>

              <div className='group bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <IconFile className='text-emerald-600' size='extra-large' />
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors'>
                  {t('日志与审计')}
                </h3>
                <p className='text-slate-500 leading-relaxed'>
                  {t('详尽的调用日志记录与可视化图表，帮助您全方位监控调用情况与排查问题。')}
                </p>
              </div>

              <div className='group bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <IconUser className='text-violet-600' size='extra-large' />
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3 group-hover:text-violet-600 transition-colors'>
                  {t('多角色管理')}
                </h3>
                <p className='text-slate-500 leading-relaxed'>
                  {t('支持管理员、普通用户等多种角色，灵活的权限控制体系满足团队协作需求。')}
                </p>
              </div>

              <div className='group bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <IconBolt className='text-amber-600' size='extra-large' />
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors'>
                  {t('极速响应')}
                </h3>
                <p className='text-slate-500 leading-relaxed'>
                  {t('基于 Go 语言的高性能架构，极低的转发延迟，确保您的应用获得最佳响应速度。')}
                </p>
              </div>
            </div>
          </div>

          <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-24'>
            <div className='flex items-center justify-center mb-10'>
              <div className='h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1'></div>
              <span className='px-4 text-slate-400 font-medium tracking-wider text-sm uppercase'>
                {t('Trusted by Developers')}
              </span>
              <div className='h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1'></div>
            </div>
            <div className='flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8'>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Moonshot size={40} />
                    </div>
                    {/* <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <OpenAI size={40} />
                    </div> */}
                    {/* <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <XAI size={40} />
                    </div> */}
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Zhipu.Color size={40} />
                    </div>
                    {/* <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Volcengine.Color size={40} />
                    </div>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Cohere.Color size={40} />
                    </div>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Claude.Color size={40} />
                    </div> */}
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Gemini.Color size={40} />
                    </div>
                    {/* <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Suno size={40} />
                    </div> */}
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Minimax.Color size={40} />
                    </div>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Wenxin.Color size={40} />
                    </div>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Spark.Color size={40} />
                    </div>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Qingyan.Color size={40} />
                    </div>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <DeepSeek.Color size={40} />
                    </div>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Qwen.Color size={40} />
                    </div>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Doubao.Color size={40} />
                    </div>
                    {/* <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Midjourney size={40} />
                    </div>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Grok size={40} />
                    </div>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <AzureAI.Color size={40} />
                    </div> */}
                    {/* <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Hunyuan.Color size={40} />
                    </div>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Xinference.Color size={40} />
                    </div> */}
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Typography.Text className='!text-lg sm:!text-xl md:!text-2xl lg:!text-3xl font-bold'>
                        30+
                      </Typography.Text>
                    </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
