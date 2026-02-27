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

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../../context/User';
import { StatusContext } from '../../context/Status';
import {
  API,
  getLogo,
  showError,
  showInfo,
  showSuccess,
  updateAPI,
  getSystemName,
  getOAuthProviderIcon,
  setUserData,
  onGitHubOAuthClicked,
  onDiscordOAuthClicked,
  onOIDCClicked,
  onLinuxDOOAuthClicked,
  onCustomOAuthClicked,
  prepareCredentialRequestOptions,
  buildAssertionResult,
  isPasskeySupported,
} from '../../helpers';
import Turnstile from 'react-turnstile';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Icon,
  Modal,
} from '@douyinfe/semi-ui';
import Title from '@douyinfe/semi-ui/lib/es/typography/title';
import Text from '@douyinfe/semi-ui/lib/es/typography/text';
import TelegramLoginButton from 'react-telegram-login';

import {
  IconGithubLogo,
  IconMail,
  IconLock,
  IconKey,
  IconLayers,
  IconCreditCard,
  IconBolt,
  IconActivity,
} from '@douyinfe/semi-icons';
import OIDCIcon from '../common/logo/OIDCIcon';
import WeChatIcon from '../common/logo/WeChatIcon';
import LinuxDoIcon from '../common/logo/LinuxDoIcon';
import TwoFAVerification from './TwoFAVerification';
import { useTranslation } from 'react-i18next';
import { SiDiscord } from 'react-icons/si';

const LoginForm = () => {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const githubButtonTextKeyByState = {
    idle: '使用 GitHub 继续',
    redirecting: '正在跳转 GitHub...',
    timeout: '请求超时，请刷新页面后重新发起 GitHub 登录',
  };
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    wechat_verification_code: '',
  });
  const { username, password } = inputs;
  const [searchParams, setSearchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState] = useContext(StatusContext);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [oidcLoading, setOidcLoading] = useState(false);
  const [linuxdoLoading, setLinuxdoLoading] = useState(false);
  const [emailLoginLoading, setEmailLoginLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [otherLoginOptionsLoading, setOtherLoginOptionsLoading] =
    useState(false);
  const [wechatCodeSubmitLoading, setWechatCodeSubmitLoading] = useState(false);
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasUserAgreement, setHasUserAgreement] = useState(false);
  const [hasPrivacyPolicy, setHasPrivacyPolicy] = useState(false);
  const [githubButtonState, setGithubButtonState] = useState('idle');
  const [githubButtonDisabled, setGithubButtonDisabled] = useState(false);
  const githubTimeoutRef = useRef(null);
  const githubButtonText = t(githubButtonTextKeyByState[githubButtonState]);
  const [customOAuthLoading, setCustomOAuthLoading] = useState({});

  const logo = getLogo();
  const systemName = getSystemName();

  let affCode = new URLSearchParams(window.location.search).get('aff');
  if (affCode) {
    localStorage.setItem('aff', affCode);
  }

  const status = useMemo(() => {
    if (statusState?.status) return statusState.status;
    const savedStatus = localStorage.getItem('status');
    if (!savedStatus) return {};
    try {
      return JSON.parse(savedStatus) || {};
    } catch (err) {
      return {};
    }
  }, [statusState?.status]);
  const hasCustomOAuthProviders =
    (status.custom_oauth_providers || []).length > 0;
  const hasOAuthLoginOptions = Boolean(
    status.github_oauth ||
    status.discord_oauth ||
    status.oidc_enabled ||
    status.wechat_login ||
    status.linuxdo_oauth ||
    status.telegram_oauth ||
    hasCustomOAuthProviders,
  );

  useEffect(() => {
    if (status?.turnstile_check) {
      setTurnstileEnabled(true);
      setTurnstileSiteKey(status.turnstile_site_key);
    }

    // 从 status 获取用户协议和隐私政策的启用状态
    setHasUserAgreement(status?.user_agreement_enabled || false);
    setHasPrivacyPolicy(status?.privacy_policy_enabled || false);
  }, [status]);

  useEffect(() => {
    isPasskeySupported()
      .then(setPasskeySupported)
      .catch(() => setPasskeySupported(false));

    return () => {
      if (githubTimeoutRef.current) {
        clearTimeout(githubTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('expired')) {
      showError(t('未登录或登录已过期，请重新登录'));
    }
  }, []);

  const onWeChatLoginClicked = () => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    setWechatLoading(true);
    setShowWeChatLoginModal(true);
    setWechatLoading(false);
  };

  const onSubmitWeChatVerificationCode = async () => {
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setWechatCodeSubmitLoading(true);
    try {
      const res = await API.get(
        `/api/oauth/wechat?code=${inputs.wechat_verification_code}`,
      );
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        setUserData(data);
        updateAPI();
        navigate('/');
        showSuccess('登录成功！');
        setShowWeChatLoginModal(false);
      } else {
        showError(message);
      }
    } catch (error) {
      showError('登录失败，请重试');
    } finally {
      setWechatCodeSubmitLoading(false);
    }
  };

  function handleChange(name, value) {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

  async function handleSubmit(e) {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setSubmitted(true);
    setLoginLoading(true);
    try {
      if (username && password) {
        const res = await API.post(
          `/api/user/login?turnstile=${turnstileToken}`,
          {
            username,
            password,
          },
        );
        const { success, message, data } = res.data;
        if (success) {
          // 检查是否需要2FA验证
          if (data && data.require_2fa) {
            setShowTwoFA(true);
            setLoginLoading(false);
            return;
          }

          userDispatch({ type: 'login', payload: data });
          setUserData(data);
          updateAPI();
          showSuccess('登录成功！');
          if (username === 'root' && password === '123456') {
            Modal.error({
              title: '您正在使用默认密码！',
              content: '请立刻修改默认密码！',
              centered: true,
            });
          }
          navigate('/console');
        } else {
          showError(message);
        }
      } else {
        showError('请输入用户名和密码！');
      }
    } catch (error) {
      showError('登录失败，请重试');
    } finally {
      setLoginLoading(false);
    }
  }

  // 添加Telegram登录处理函数
  const onTelegramLoginClicked = async (response) => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    const fields = [
      'id',
      'first_name',
      'last_name',
      'username',
      'photo_url',
      'auth_date',
      'hash',
      'lang',
    ];
    const params = {};
    fields.forEach((field) => {
      if (response[field]) {
        params[field] = response[field];
      }
    });
    try {
      const res = await API.get(`/api/oauth/telegram/login`, { params });
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        showSuccess('登录成功！');
        setUserData(data);
        updateAPI();
        navigate('/');
      } else {
        showError(message);
      }
    } catch (error) {
      showError('登录失败，请重试');
    }
  };

  // 包装的GitHub登录点击处理
  const handleGitHubClick = () => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    if (githubButtonDisabled) {
      return;
    }
    setGithubLoading(true);
    setGithubButtonDisabled(true);
    setGithubButtonState('redirecting');
    if (githubTimeoutRef.current) {
      clearTimeout(githubTimeoutRef.current);
    }
    githubTimeoutRef.current = setTimeout(() => {
      setGithubLoading(false);
      setGithubButtonState('timeout');
      setGithubButtonDisabled(true);
    }, 20000);
    try {
      onGitHubOAuthClicked(status.github_client_id, { shouldLogout: true });
    } finally {
      // 由于重定向，这里不会执行到，但为了完整性添加
      setTimeout(() => setGithubLoading(false), 3000);
    }
  };

  // 包装的Discord登录点击处理
  const handleDiscordClick = () => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    setDiscordLoading(true);
    try {
      onDiscordOAuthClicked(status.discord_client_id, { shouldLogout: true });
    } finally {
      // 由于重定向，这里不会执行到，但为了完整性添加
      setTimeout(() => setDiscordLoading(false), 3000);
    }
  };

  // 包装的OIDC登录点击处理
  const handleOIDCClick = () => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    setOidcLoading(true);
    try {
      onOIDCClicked(
        status.oidc_authorization_endpoint,
        status.oidc_client_id,
        false,
        { shouldLogout: true },
      );
    } finally {
      // 由于重定向，这里不会执行到，但为了完整性添加
      setTimeout(() => setOidcLoading(false), 3000);
    }
  };

  // 包装的LinuxDO登录点击处理
  const handleLinuxDOClick = () => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    setLinuxdoLoading(true);
    try {
      onLinuxDOOAuthClicked(status.linuxdo_client_id, { shouldLogout: true });
    } finally {
      // 由于重定向，这里不会执行到，但为了完整性添加
      setTimeout(() => setLinuxdoLoading(false), 3000);
    }
  };

  // 包装的自定义OAuth登录点击处理
  const handleCustomOAuthClick = (provider) => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    setCustomOAuthLoading((prev) => ({ ...prev, [provider.slug]: true }));
    try {
      onCustomOAuthClicked(provider, { shouldLogout: true });
    } finally {
      // 由于重定向，这里不会执行到，但为了完整性添加
      setTimeout(() => {
        setCustomOAuthLoading((prev) => ({ ...prev, [provider.slug]: false }));
      }, 3000);
    }
  };

  // 包装的邮箱登录选项点击处理
  const handleEmailLoginClick = () => {
    setEmailLoginLoading(true);
    setShowEmailLogin(true);
    setEmailLoginLoading(false);
  };

  const handlePasskeyLogin = async () => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    if (!passkeySupported) {
      showInfo('当前环境无法使用 Passkey 登录');
      return;
    }
    if (!window.PublicKeyCredential) {
      showInfo('当前浏览器不支持 Passkey');
      return;
    }

    setPasskeyLoading(true);
    try {
      const beginRes = await API.post('/api/user/passkey/login/begin');
      const { success, message, data } = beginRes.data;
      if (!success) {
        showError(message || '无法发起 Passkey 登录');
        return;
      }

      const publicKeyOptions = prepareCredentialRequestOptions(
        data?.options || data?.publicKey || data,
      );
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyOptions,
      });
      const payload = buildAssertionResult(assertion);
      if (!payload) {
        showError('Passkey 验证失败，请重试');
        return;
      }

      const finishRes = await API.post(
        '/api/user/passkey/login/finish',
        payload,
      );
      const finish = finishRes.data;
      if (finish.success) {
        userDispatch({ type: 'login', payload: finish.data });
        setUserData(finish.data);
        updateAPI();
        showSuccess('登录成功！');
        navigate('/console');
      } else {
        showError(finish.message || 'Passkey 登录失败，请重试');
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        showInfo('已取消 Passkey 登录');
      } else {
        showError('Passkey 登录失败，请重试');
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  // 包装的重置密码点击处理
  const handleResetPasswordClick = () => {
    setResetPasswordLoading(true);
    navigate('/reset');
    setResetPasswordLoading(false);
  };

  // 包装的其他登录选项点击处理
  const handleOtherLoginOptionsClick = () => {
    setOtherLoginOptionsLoading(true);
    setShowEmailLogin(false);
    setOtherLoginOptionsLoading(false);
  };

  // 2FA验证成功处理
  const handle2FASuccess = (data) => {
    userDispatch({ type: 'login', payload: data });
    setUserData(data);
    updateAPI();
    showSuccess('登录成功！');
    navigate('/console');
  };

  // 返回登录页面
  const handleBackToLogin = () => {
    setShowTwoFA(false);
    setInputs({ username: '', password: '', wechat_verification_code: '' });
  };

  const renderOAuthOptions = () => {
    return (
      <div className='flex flex-col items-center login-oauth-wrapper'>
        <div className='w-full max-w-md login-oauth-container'>
          <div className='bg-transparent oauth-form-content'>
            <div className='py-1 login-oauth-action-area'>
              <div className='space-y-3 login-oauth-btn-group'>
                {status.wechat_login && (
                  <Button
                    theme='outline'
                    className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all duration-200 login-oauth-btn !text-slate-700 dark:!text-slate-200'
                    type='tertiary'
                    icon={
                      <Icon svg={<WeChatIcon />} style={{ color: '#07C160' }} />
                    }
                    onClick={onWeChatLoginClicked}
                    loading={wechatLoading}
                  >
                    <span className='ml-3'>{t('使用 微信 继续')}</span>
                  </Button>
                )}

                {status.github_oauth && (
                  <Button
                    theme='outline'
                    className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all duration-200 login-oauth-btn !text-slate-700 dark:!text-slate-200'
                    type='tertiary'
                    icon={<IconGithubLogo size='large' />}
                    onClick={handleGitHubClick}
                    loading={githubLoading}
                    disabled={githubButtonDisabled}
                  >
                    <span className='ml-3'>{githubButtonText}</span>
                  </Button>
                )}

                {status.discord_oauth && (
                  <Button
                    theme='outline'
                    className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all duration-200 login-oauth-btn !text-slate-700 dark:!text-slate-200'
                    type='tertiary'
                    icon={
                      <SiDiscord
                        style={{
                          color: '#5865F2',
                          width: '20px',
                          height: '20px',
                        }}
                      />
                    }
                    onClick={handleDiscordClick}
                    loading={discordLoading}
                  >
                    <span className='ml-3'>{t('使用 Discord 继续')}</span>
                  </Button>
                )}

                {status.oidc_enabled && (
                  <Button
                    theme='outline'
                    className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all duration-200 login-oauth-btn !text-slate-700 dark:!text-slate-200'
                    type='tertiary'
                    icon={<OIDCIcon style={{ color: '#1877F2' }} />}
                    onClick={handleOIDCClick}
                    loading={oidcLoading}
                  >
                    <span className='ml-3'>{t('使用 OIDC 继续')}</span>
                  </Button>
                )}

                {status.linuxdo_oauth && (
                  <Button
                    theme='outline'
                    className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all duration-200 login-oauth-btn !text-slate-700 dark:!text-slate-200'
                    type='tertiary'
                    icon={
                      <LinuxDoIcon
                        style={{
                          color: '#E95420',
                          width: '20px',
                          height: '20px',
                        }}
                      />
                    }
                    onClick={handleLinuxDOClick}
                    loading={linuxdoLoading}
                  >
                    <span className='ml-3'>{t('使用 LinuxDO 继续')}</span>
                  </Button>
                )}

                {status.custom_oauth_providers &&
                  status.custom_oauth_providers.map((provider) => (
                    <Button
                      key={provider.slug}
                      theme='outline'
                      className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all duration-200 login-oauth-btn !text-slate-700 dark:!text-slate-200'
                      type='tertiary'
                      icon={getOAuthProviderIcon(provider.icon || '', 20)}
                      onClick={() => handleCustomOAuthClick(provider)}
                      loading={customOAuthLoading[provider.slug]}
                    >
                      <span className='ml-3'>
                        {t('使用 {{name}} 继续', { name: provider.name })}
                      </span>
                    </Button>
                  ))}

                {status.telegram_oauth && (
                  <div className='flex justify-center my-2'>
                    <TelegramLoginButton
                      dataOnauth={onTelegramLoginClicked}
                      botName={status.telegram_bot_name}
                    />
                  </div>
                )}

                {status.passkey_login && passkeySupported && (
                  <Button
                    theme='outline'
                    className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all duration-200 login-oauth-btn !text-slate-700 dark:!text-slate-200'
                    type='tertiary'
                    icon={<IconKey size='large' />}
                    onClick={handlePasskeyLogin}
                    loading={passkeyLoading}
                  >
                    <span className='ml-3'>{t('使用 Passkey 登录')}</span>
                  </Button>
                )}

                <Divider margin='12px' align='center'>
                  {t('或')}
                </Divider>

                <Button
                  theme='solid'
                  type='primary'
                  className='w-full h-12 flex items-center justify-center !rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md login-email-redirect-btn'
                  icon={<IconMail size='large' />}
                  onClick={handleEmailLoginClick}
                  loading={emailLoginLoading}
                >
                  <span className='ml-3'>{t('使用 邮箱或用户名 登录')}</span>
                </Button>
              </div>

              {(hasUserAgreement || hasPrivacyPolicy) && (
                <div className='mt-6'>
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  >
                    <Text size='small' className='text-gray-600 dark:text-gray-400'>
                      {t('我已阅读并同意')}
                      {hasUserAgreement && (
                        <>
                          <a
                            href='/user-agreement'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mx-1'
                          >
                            {t('用户协议')}
                          </a>
                        </>
                      )}
                      {hasUserAgreement && hasPrivacyPolicy && t('和')}
                      {hasPrivacyPolicy && (
                        <>
                          <a
                            href='/privacy-policy'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mx-1'
                          >
                            {t('隐私政策')}
                          </a>
                        </>
                      )}
                    </Text>
                  </Checkbox>
                </div>
              )}

              {!status.self_use_mode_enabled && (
                <div className='mt-8 text-center text-sm login-register-link-container'>
                  <Text className='text-gray-900 dark:text-gray-100'>
                    {t('没有账户？')}{' '}
                    <Link
                      to='/register'
                      className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors login-register-link'
                    >
                      {t('注册')}
                    </Link>
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmailLoginForm = () => {
    return (
      <div className='flex flex-col items-center w-full login-email-wrapper'>
        <div className='w-full login-email-container'>
          <div className='bg-transparent email-form-content'>
            <div className='py-1 login-email-action-area'>
              {status.passkey_login && passkeySupported && (
                <Button
                  theme='outline'
                  type='tertiary'
                  className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-4 !text-slate-700 dark:!text-slate-200'
                  icon={<IconKey size='large' />}
                  onClick={handlePasskeyLogin}
                  loading={passkeyLoading}
                >
                  <span className='ml-3'>{t('使用 Passkey 登录')}</span>
                </Button>
              )}
              <Form className='space-y-4' onSubmit={handleSubmit}>
                <Form.Input
                  field='username'
                  label={t('用户名或邮箱')}
                  placeholder={t('请输入您的用户名或邮箱地址')}
                  name='username'
                  onChange={(value) => handleChange('username', value)}
                  prefix={<IconMail className='text-gray-400 dark:text-gray-500' />}
                  className='!rounded-xl !h-12 custom-auth-input login-input-field'
                  noLabel={true}
                  size='large'
                />

                <Form.Input
                  field='password'
                  label={t('密码')}
                  placeholder={t('请输入您的密码')}
                  name='password'
                  mode='password'
                  onChange={(value) => handleChange('password', value)}
                  prefix={<IconLock className='text-gray-400 dark:text-gray-500' />}
                  className='!rounded-xl !h-12 custom-auth-input login-input-field'
                  noLabel={true}
                  size='large'
                />

                <div className='flex items-center justify-between pt-2 pb-2'>
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  >
                    <Text className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors'>
                      {t('记住我')}
                    </Text>
                  </Checkbox>

                  <Button
                    theme='borderless'
                    type='tertiary'
                    className='!text-blue-600 dark:!text-blue-400 hover:!text-blue-700 dark:hover:!text-blue-300 !font-medium !p-0'
                    onClick={handleResetPasswordClick}
                  >
                    {t('忘记密码？')}
                  </Button>
                </div>

                <div className='pt-2'>
                  <Button
                    theme='solid'
                    type='primary'
                    htmlType='submit'
                    className='w-full !h-12 !rounded-xl !text-base !font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 login-submit-btn'
                    loading={loginLoading}
                    disabled={loginLoading}
                  >
                    {t('登录')}
                  </Button>
                </div>

                {(hasUserAgreement || hasPrivacyPolicy) && (
                  <div className='flex items-center justify-center pt-4 text-xs text-gray-400 dark:text-gray-500'>
                    <span>
                      {t('登录即代表您同意')}
                      {hasUserAgreement && (
                        <a
                          href='/user-agreement'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mx-1'
                        >
                          {t('用户协议')}
                        </a>
                      )}
                      {hasUserAgreement && hasPrivacyPolicy && t('和')}
                      {hasPrivacyPolicy && (
                        <a
                          href='/privacy-policy'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mx-1'
                        >
                          {t('隐私政策')}
                        </a>
                      )}
                    </span>
                  </div>
                )}
              </Form>

              {hasOAuthLoginOptions && (
                <>
                  <Divider margin='12px' align='center'>
                    {t('或')}
                  </Divider>

                  <div className='mt-4 text-center'>
                    <Button
                      theme='outline'
                      type='tertiary'
                      className='w-full !rounded-xl dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800'
                      onClick={handleOtherLoginOptionsClick}
                      loading={otherLoginOptionsLoading}
                    >
                      {t('其他登录选项')}
                    </Button>
                  </div>
                </>
              )}

              {!status.self_use_mode_enabled && (
                <div className='mt-8 text-center text-sm login-register-link-container'>
                  <Text className='text-gray-900 dark:text-gray-100'>
                    {t('没有账户？')}{' '}
                    <Link
                      to='/register'
                      className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors login-register-link'
                    >
                      {t('注册')}
                    </Link>
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 微信登录模态框
  const renderWeChatLoginModal = () => {
    return (
      <Modal
        title={t('微信扫码登录')}
        visible={showWeChatLoginModal}
        maskClosable={true}
        onOk={onSubmitWeChatVerificationCode}
        onCancel={() => setShowWeChatLoginModal(false)}
        okText={t('登录')}
        centered={true}
        okButtonProps={{
          loading: wechatCodeSubmitLoading,
        }}
      >
        <div className='flex flex-col items-center'>
          <img src={status.wechat_qrcode} alt='微信二维码' className='mb-4' />
        </div>

        <div className='text-center mb-4'>
          <p>
            {t('微信扫码关注公众号，输入「验证码」获取验证码（三分钟内有效）')}
          </p>
        </div>

        <Form>
          <Form.Input
            field='wechat_verification_code'
            placeholder={t('验证码')}
            label={t('验证码')}
            value={inputs.wechat_verification_code}
            onChange={(value) =>
              handleChange('wechat_verification_code', value)
            }
          />
        </Form>
      </Modal>
    );
  };

  // 2FA验证弹窗
  const render2FAModal = () => {
    return (
      <Modal
        title={
          <div className='flex items-center'>
            <div className='w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3'>
              <svg
                className='w-4 h-4 text-green-600 dark:text-green-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M6 8a2 2 0 11-4 0 2 2 0 014 0zM8 7a1 1 0 100 2h8a1 1 0 100-2H8zM6 14a2 2 0 11-4 0 2 2 0 014 0zM8 13a1 1 0 100 2h8a1 1 0 100-2H8z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            两步验证
          </div>
        }
        visible={showTwoFA}
        onCancel={handleBackToLogin}
        footer={null}
        width={450}
        centered
      >
        <TwoFAVerification
          onSuccess={handle2FASuccess}
          onBack={handleBackToLogin}
          isModal={true}
        />
      </Modal>
    );
  };

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden p-4 sm:p-6'>
      {/* 背景装饰 */}
      <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 dark:bg-blue-900/20 blur-[100px] pointer-events-none' />
      <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 dark:bg-indigo-900/20 blur-[100px] pointer-events-none' />

      <div className='w-full max-w-6xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-[32px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.1)] border border-white/60 dark:border-slate-700/60 overflow-hidden flex flex-col lg:flex-row relative z-10 min-h-[600px] lg:min-h-[720px]'>

        {/* 左侧：价值主张区 - 加深背景增加对比度 */}
        <div className='hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 relative bg-slate-50/50 dark:bg-slate-900/50'>
          {/* 装饰圆点 */}
          <div className='absolute top-12 left-12 w-20 h-20 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-2xl'></div>
          <div className='absolute bottom-12 right-12 w-32 h-32 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl'></div>

          <div className='max-w-lg relative z-10'>
            <div className='inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/50 shadow-sm mb-8 w-fit'>
              <span className='w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse'></span>
              <span className='text-xs font-medium text-blue-700 dark:text-blue-400 tracking-wide'>
                {t('企业级 AI 网关')}
              </span>
            </div>
            <h1 className='text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-6'>
              {t('统一管理所有的')} <br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'>
                {t('AI 模型接口')}
              </span>
            </h1>
            <p className='text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed'>
              {t(
                '一站式接入 OpenAI、Claude、Gemini 等主流大模型，提供企业级的分发、计费与风控能力。',
              )}
            </p>

            <div className='grid grid-cols-2 gap-4'>
              <div className='p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group'>
                <div className='w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors duration-300'>
                  <IconLayers className='text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300' size='large' />
                </div>
                <Text className='text-slate-900 dark:text-slate-100 font-semibold block text-base mb-1'>
                  {t('统一路由')}
                </Text>
                <Text className='text-slate-500 dark:text-slate-400 text-xs leading-relaxed block'>
                  {t('多家模型一处管理')}
                </Text>
              </div>
              <div className='p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group'>
                <div className='w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3 group-hover:bg-indigo-600 transition-colors duration-300'>
                  <IconCreditCard className='text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors duration-300' size='large' />
                </div>
                <Text className='text-slate-900 dark:text-slate-100 font-semibold block text-base mb-1'>
                  {t('成本可控')}
                </Text>
                <Text className='text-slate-500 dark:text-slate-400 text-xs leading-relaxed block'>
                  {t('按需切换与限流')}
                </Text>
              </div>
              <div className='p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group'>
                <div className='w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center mb-3 group-hover:bg-cyan-600 transition-colors duration-300'>
                  <IconBolt className='text-cyan-600 dark:text-cyan-400 group-hover:text-white transition-colors duration-300' size='large' />
                </div>
                <Text className='text-slate-900 dark:text-slate-100 font-semibold block text-base mb-1'>
                  {t('简单接入')}
                </Text>
                <Text className='text-slate-500 dark:text-slate-400 text-xs leading-relaxed block'>
                  {t('替换基址即可使用')}
                </Text>
              </div>
              <div className='p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group'>
                <div className='w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-3 group-hover:bg-emerald-600 transition-colors duration-300'>
                  <IconActivity className='text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors duration-300' size='large' />
                </div>
                <Text className='text-slate-900 dark:text-slate-100 font-semibold block text-base mb-1'>
                  {t('稳定监控')}
                </Text>
                <Text className='text-slate-500 dark:text-slate-400 text-xs leading-relaxed block'>
                  {t('核心指标一目了然')}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：登录表单区 - 纯白背景 */}
        <div className='flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12 bg-white dark:bg-slate-800 relative login-right-panel'>
          <div className='w-full max-w-[400px] login-form-wrapper'>
            <div className='text-center mb-10 login-header-hero'>
              <h2 className='text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 login-welcome-title'>{t('欢迎回来')}</h2>
              <p className='text-slate-500 dark:text-slate-400 text-sm login-welcome-subtitle'>{t('请输入您的账户信息以登录')}</p>
            </div>

            {status.turnstile_check && (
              <div className='mb-6'>
                <Turnstile
                  sitekey={status.turnstile_site_key}
                  onVerify={(token) => {
                    setTurnstileToken(token);
                  }}
                />
              </div>
            )}

            {showEmailLogin || !hasOAuthLoginOptions
              ? renderEmailLoginForm()
              : renderOAuthOptions()}
            {renderWeChatLoginModal()}
            {render2FAModal()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
