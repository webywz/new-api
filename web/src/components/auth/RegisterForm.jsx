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
import { Link, useNavigate } from 'react-router-dom';
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
  onDiscordOAuthClicked,
  onCustomOAuthClicked,
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
import {
  IconGithubLogo,
  IconMail,
  IconUser,
  IconLock,
  IconKey,
  IconLayers,
  IconCreditCard,
  IconBolt,
  IconActivity,
} from '@douyinfe/semi-icons';
import {
  onGitHubOAuthClicked,
  onLinuxDOOAuthClicked,
  onOIDCClicked,
} from '../../helpers';
import OIDCIcon from '../common/logo/OIDCIcon';
import LinuxDoIcon from '../common/logo/LinuxDoIcon';
import WeChatIcon from '../common/logo/WeChatIcon';
import TelegramLoginButton from 'react-telegram-login/src';
import { UserContext } from '../../context/User';
import { StatusContext } from '../../context/Status';
import { useTranslation } from 'react-i18next';
import { SiDiscord } from 'react-icons/si';

const RegisterForm = () => {
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
    password2: '',
    email: '',
    phone: '',
    verification_code: '',
    phone_verification_code: '',
    wechat_verification_code: '',
  });
  const { username, password, password2, phone } = inputs;
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState] = useContext(StatusContext);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(false);
  const [showEmailRegister, setShowEmailRegister] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [oidcLoading, setOidcLoading] = useState(false);
  const [linuxdoLoading, setLinuxdoLoading] = useState(false);
  const [emailRegisterLoading, setEmailRegisterLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [verificationCodeLoading, setVerificationCodeLoading] = useState(false);
  const [otherRegisterOptionsLoading, setOtherRegisterOptionsLoading] =
    useState(false);
  const [wechatCodeSubmitLoading, setWechatCodeSubmitLoading] = useState(false);
  const [customOAuthLoading, setCustomOAuthLoading] = useState({});
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [disablePhoneButton, setDisablePhoneButton] = useState(false);
  const [phoneCountdown, setPhoneCountdown] = useState(60);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasUserAgreement, setHasUserAgreement] = useState(false);
  const [hasPrivacyPolicy, setHasPrivacyPolicy] = useState(false);
  const [githubButtonState, setGithubButtonState] = useState('idle');
  const [githubButtonDisabled, setGithubButtonDisabled] = useState(false);
  const githubTimeoutRef = useRef(null);
  const githubButtonText = t(githubButtonTextKeyByState[githubButtonState]);

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
  const hasOAuthRegisterOptions = Boolean(
    status.github_oauth ||
    status.discord_oauth ||
    status.oidc_enabled ||
    status.wechat_login ||
    status.linuxdo_oauth ||
    status.telegram_oauth ||
    hasCustomOAuthProviders,
  );

  const [showEmailVerification, setShowEmailVerification] = useState(false);

  useEffect(() => {
    setShowEmailVerification(!!status?.email_verification);
    if (status?.turnstile_check) {
      setTurnstileEnabled(true);
      setTurnstileSiteKey(status.turnstile_site_key);
    }

    // 从 status 获取用户协议和隐私政策的启用状态
    setHasUserAgreement(status?.user_agreement_enabled || false);
    setHasPrivacyPolicy(status?.privacy_policy_enabled || false);
  }, [status]);

  useEffect(() => {
    let countdownInterval = null;
    if (disableButton && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setDisableButton(false);
      setCountdown(30);
    }
    return () => clearInterval(countdownInterval); // Clean up on unmount
  }, [disableButton, countdown]);

  useEffect(() => {
    let phoneCountdownInterval = null;
    if (disablePhoneButton && phoneCountdown > 0) {
      phoneCountdownInterval = setInterval(() => {
        setPhoneCountdown(phoneCountdown - 1);
      }, 1000);
    } else if (phoneCountdown === 0) {
      setDisablePhoneButton(false);
      setPhoneCountdown(60);
    }
    return () => clearInterval(phoneCountdownInterval); // Clean up on unmount
  }, [disablePhoneButton, phoneCountdown]);

  useEffect(() => {
    return () => {
      if (githubTimeoutRef.current) {
        clearTimeout(githubTimeoutRef.current);
      }
    };
  }, []);

  const onWeChatLoginClicked = () => {
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
    if (password.length < 8) {
      showInfo('密码长度不得小于 8 位！');
      return;
    }
    if (password !== password2) {
      showInfo('两次输入的密码不一致');
      return;
    }
    if (username && password) {
      if (turnstileEnabled && turnstileToken === '') {
        showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
        return;
      }
      setRegisterLoading(true);
      try {
        if (!affCode) {
          affCode = localStorage.getItem('aff');
        }
        inputs.aff_code = affCode;
        const res = await API.post(
          `/api/user/register?turnstile=${turnstileToken}`,
          inputs,
        );
        const { success, message } = res.data;
        if (success) {
          navigate('/login');
          showSuccess('注册成功！');
        } else {
          showError(message);
        }
      } catch (error) {
        showError('注册失败，请重试');
      } finally {
        setRegisterLoading(false);
      }
    }
  }

  const sendVerificationCode = async () => {
    if (inputs.email === '') return;
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setVerificationCodeLoading(true);
    try {
      const res = await API.get(
        `/api/verification?email=${encodeURIComponent(inputs.email)}&turnstile=${turnstileToken}`,
      );
      const { success, message } = res.data;
      if (success) {
        showSuccess('验证码发送成功，请检查你的邮箱！');
        setDisableButton(true); // 发送成功后禁用按钮，开始倒计时
      } else {
        showError(message);
      }
    } catch (error) {
      showError('发送验证码失败，请重试');
    } finally {
      setVerificationCodeLoading(false);
    }
  };

  const sendPhoneVerificationCode = async () => {
    if (inputs.phone === '') {
      showInfo('请输入手机号');
      return;
    }
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setVerificationCodeLoading(true);
    try {
      const res = await API.get(
        `/api/verification/sms?phone=${encodeURIComponent(inputs.phone)}&turnstile=${turnstileToken}`,
      );
      const { success, message } = res.data;
      if (success) {
        showSuccess('短信验证码发送成功！');
        setDisablePhoneButton(true); // 发送成功后禁用按钮，开始倒计时
      } else {
        showError(message);
      }
    } catch (error) {
      showError('发送短信验证码失败，请重试');
    } finally {
      setVerificationCodeLoading(false);
    }
  };

  const handleGitHubClick = () => {
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
      setTimeout(() => setGithubLoading(false), 3000);
    }
  };

  const handleDiscordClick = () => {
    setDiscordLoading(true);
    try {
      onDiscordOAuthClicked(status.discord_client_id, { shouldLogout: true });
    } finally {
      setTimeout(() => setDiscordLoading(false), 3000);
    }
  };

  const handleOIDCClick = () => {
    setOidcLoading(true);
    try {
      onOIDCClicked(
        status.oidc_authorization_endpoint,
        status.oidc_client_id,
        false,
        { shouldLogout: true },
      );
    } finally {
      setTimeout(() => setOidcLoading(false), 3000);
    }
  };

  const handleLinuxDOClick = () => {
    setLinuxdoLoading(true);
    try {
      onLinuxDOOAuthClicked(status.linuxdo_client_id, { shouldLogout: true });
    } finally {
      setTimeout(() => setLinuxdoLoading(false), 3000);
    }
  };

  const handleCustomOAuthClick = (provider) => {
    setCustomOAuthLoading((prev) => ({ ...prev, [provider.slug]: true }));
    try {
      onCustomOAuthClicked(provider, { shouldLogout: true });
    } finally {
      setTimeout(() => {
        setCustomOAuthLoading((prev) => ({ ...prev, [provider.slug]: false }));
      }, 3000);
    }
  };

  const handleEmailRegisterClick = () => {
    setEmailRegisterLoading(true);
    setShowEmailRegister(true);
    setEmailRegisterLoading(false);
  };

  const handleOtherRegisterOptionsClick = () => {
    setOtherRegisterOptionsLoading(true);
    setShowEmailRegister(false);
    setOtherRegisterOptionsLoading(false);
  };

  const onTelegramLoginClicked = async (response) => {
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

  const renderOAuthOptions = () => {
    return (
      <div className='flex flex-col items-center register-oauth-wrapper'>
        <div className='w-full max-w-md register-oauth-container'>
          <div className='bg-transparent oauth-form-content'>
            <div className='py-1 register-oauth-action-area'>
              <div className='space-y-3 register-oauth-btn-group'>
                {status.wechat_login && (
                  <Button
                    theme='outline'
                    className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 register-oauth-btn'
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
                    className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 hover:bg-slate-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 register-oauth-btn'
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
                    className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 hover:bg-slate-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 register-oauth-btn'
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
                    className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 hover:bg-slate-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 register-oauth-btn'
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
                    className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 hover:bg-slate-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 register-oauth-btn'
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
                      className='w-full h-12 flex items-center justify-center !rounded-xl border border-gray-200 hover:bg-slate-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 register-oauth-btn'
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

                <Divider margin='12px' align='center'>
                  {t('或')}
                </Divider>

                <Button
                  theme='solid'
                  type='primary'
                  className='w-full h-12 flex items-center justify-center !rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md register-email-redirect-btn'
                  icon={<IconMail size='large' />}
                  onClick={handleEmailRegisterClick}
                  loading={emailRegisterLoading}
                >
                  <span className='ml-3'>{t('使用 用户名 注册')}</span>
                </Button>
              </div>

              <div className='mt-8 text-center text-sm register-login-link-container'>
                <Text>
                  {t('已有账户？')}{' '}
                  <Link
                    to='/login'
                    className='text-blue-600 hover:text-blue-800 font-medium transition-colors register-login-link'
                  >
                    {t('登录')}
                  </Link>
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmailRegisterForm = () => {
    return (
      <div className='flex flex-col items-center w-full register-email-wrapper'>
        <div className='w-full register-email-container'>
          <div className='bg-transparent email-form-content'>
            <div className='py-1 register-email-action-area'>
              <Form className='space-y-4'>
                <Form.Input
                  field='username'
                  label={t('用户名')}
                  placeholder={t('请输入用户名')}
                  name='username'
                  onChange={(value) => handleChange('username', value)}
                  prefix={<IconUser className='text-gray-400' />}
                  className='!rounded-xl !h-12 !bg-gray-50 border-gray-200 hover:!bg-white focus:!bg-white focus:!border-blue-500 focus:!ring-4 focus:!ring-blue-500/10 transition-all duration-200 register-input-field'
                  noLabel={true}
                  size='large'
                />

                <Form.Input
                  field='password'
                  label={t('密码')}
                  placeholder={t('请输入密码')}
                  name='password'
                  mode='password'
                  onChange={(value) => handleChange('password', value)}
                  prefix={<IconLock className='text-gray-400' />}
                  className='!rounded-xl !h-12 !bg-gray-50 border-gray-200 hover:!bg-white focus:!bg-white focus:!border-blue-500 focus:!ring-4 focus:!ring-blue-500/10 transition-all duration-200 register-input-field'
                  noLabel={true}
                  size='large'
                />

                <Form.Input
                  field='password2'
                  label={t('确认密码')}
                  placeholder={t('请再次输入密码')}
                  name='password2'
                  mode='password'
                  onChange={(value) => handleChange('password2', value)}
                  prefix={<IconLock className='text-gray-400' />}
                  className='!rounded-xl !h-12 !bg-gray-50 border-gray-200 hover:!bg-white focus:!bg-white focus:!border-blue-500 focus:!ring-4 focus:!ring-blue-500/10 transition-all duration-200 register-input-field'
                  noLabel={true}
                  size='large'
                />

                {showEmailVerification && (
                  <>
                    <Form.Input
                      field='email'
                      label={t('邮箱')}
                      placeholder={t('请输入邮箱地址')}
                      name='email'
                      onChange={(value) => handleChange('email', value)}
                      prefix={<IconMail className='text-gray-400' />}
                      className='!rounded-xl !h-12 !bg-gray-50 border-gray-200 hover:!bg-white focus:!bg-white focus:!border-blue-500 focus:!ring-4 focus:!ring-blue-500/10 transition-all duration-200 register-input-field'
                      noLabel={true}
                      size='large'
                    />
                    <Form.Input
                      field='verification_code'
                      label={t('验证码')}
                      placeholder={t('请输入验证码')}
                      name='verification_code'
                      onChange={(value) => handleChange('verification_code', value)}
                      prefix={<IconKey className='text-gray-400' />}
                      className='!rounded-xl !h-12 !bg-gray-50 border-gray-200 hover:!bg-white focus:!bg-white focus:!border-blue-500 focus:!ring-4 focus:!ring-blue-500/10 transition-all duration-200 register-input-field'
                      noLabel={true}
                      size='large'
                      suffix={
                        <Button
                          theme='solid'
                          type='primary'
                          onClick={sendVerificationCode}
                          disabled={verificationCodeLoading || disableButton}
                          className='mr-1 !rounded-lg !h-8 !px-3 !bg-blue-100 !text-blue-600 hover:!bg-blue-200 hover:!text-blue-700 !border-none !font-medium active:scale-[0.95] transition-all register-send-code-btn'
                        >
                          {disableButton
                            ? `${t('重发')} (${countdown})`
                            : t('发送')}
                        </Button>
                      }
                    />
                  </>
                )}

                <Form.Input
                  field='phone'
                  label={t('手机号')}
                  placeholder={t('请输入手机号')}
                  name='phone'
                  onChange={(value) => handleChange('phone', value)}
                  prefix={<IconUser className='text-gray-400' />}
                  className='!rounded-xl !h-12 !bg-gray-50 border-gray-200 hover:!bg-white focus:!bg-white focus:!border-blue-500 focus:!ring-4 focus:!ring-blue-500/10 transition-all duration-200 register-input-field phone-input'
                  noLabel={true}
                  size='large'
                />

                <Form.Input
                  field='phone_verification_code'
                  label={t('短信验证码')}
                  placeholder={t('请输入短信验证码')}
                  name='phone_verification_code'
                  onChange={(value) => handleChange('phone_verification_code', value)}
                  prefix={<IconKey className='text-gray-400' />}
                  className='!rounded-xl !h-12 !bg-gray-50 border-gray-200 hover:!bg-white focus:!bg-white focus:!border-blue-500 focus:!ring-4 focus:!ring-blue-500/10 transition-all duration-200 register-input-field phone-code-input'
                  noLabel={true}
                  size='large'
                  suffix={
                    <Button
                      theme='solid'
                      type='primary'
                      onClick={sendPhoneVerificationCode}
                      disabled={verificationCodeLoading || disablePhoneButton}
                      className='mr-1 !rounded-lg !h-8 !px-3 !bg-blue-100 !text-blue-600 hover:!bg-blue-200 hover:!text-blue-700 !border-none !font-medium active:scale-[0.95] transition-all register-send-code-btn'
                    >
                      {disablePhoneButton
                        ? `${t('重发')} (${phoneCountdown})`
                        : t('发送验证码')}
                    </Button>
                  }
                />



                <div className='flex items-center justify-between pt-2 pb-2'>
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  >
                    <Text className='text-gray-500 hover:text-gray-700 transition-colors'>
                      {t('我已阅读并同意')}
                    </Text>
                  </Checkbox>
                </div>

                <div className='pt-2'>
                  <Button
                    theme='solid'
                    type='primary'
                    htmlType='submit'
                    className='w-full !h-12 !rounded-xl !text-base !font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 register-submit-btn'
                    onClick={handleSubmit}
                    loading={registerLoading}
                    disabled={registerLoading || !agreedToTerms}
                  >
                    {t('注册')}
                  </Button>
                </div>

                {(hasUserAgreement || hasPrivacyPolicy) && (
                  <div className='flex items-center justify-center pt-4 text-xs text-gray-400'>
                    <span>
                      {t('注册即代表您同意')}
                      {hasUserAgreement && (
                        <a
                          href='/user-agreement'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:text-blue-800 mx-1'
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
                          className='text-blue-600 hover:text-blue-800 mx-1'
                        >
                          {t('隐私政策')}
                        </a>
                      )}
                    </span>
                  </div>
                )}
              </Form>

              {hasOAuthRegisterOptions && (
                <>
                  <Divider margin='12px' align='center'>
                    {t('或')}
                  </Divider>

                  <div className='mt-4 text-center'>
                    <Button
                      theme='outline'
                      type='tertiary'
                      className='w-full !rounded-xl'
                      onClick={handleOtherRegisterOptionsClick}
                      loading={otherRegisterOptionsLoading}
                    >
                      {t('其他注册选项')}
                    </Button>
                  </div>
                </>
              )}

              <div className='mt-8 text-center text-sm register-login-link-container'>
                <Text>
                  {t('已有账户？')}{' '}
                  <Link
                    to='/login'
                    className='text-blue-600 hover:text-blue-800 font-medium transition-colors register-login-link'
                  >
                    {t('登录')}
                  </Link>
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden p-4 sm:p-6'>
      {/* 背景装饰 */}
      <div className='absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[100px] pointer-events-none' />
      <div className='absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[100px] pointer-events-none' />

      <div className='w-full max-w-6xl bg-white/70 backdrop-blur-xl rounded-[32px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden flex flex-col lg:flex-row relative z-10 min-h-[600px] lg:min-h-[720px]'>

        {/* 左侧：价值主张区 - 加深背景增加对比度 */}
        <div className='hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 relative bg-slate-50/50'>
          {/* 装饰圆点 */}
          <div className='absolute top-12 right-12 w-20 h-20 bg-blue-200/20 rounded-full blur-2xl'></div>
          <div className='absolute bottom-12 left-12 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl'></div>

          <div className='max-w-lg relative z-10'>
            <div className='inline-flex items-center px-3 py-1 rounded-full bg-white border border-blue-100 shadow-sm mb-8 w-fit'>
              <span className='w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse'></span>
              <span className='text-xs font-medium text-blue-700 tracking-wide'>
                {t('立即加入')}
              </span>
            </div>
            <h1 className='text-4xl font-bold text-slate-900 leading-tight mb-6'>
              {t('开启您的')} <br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'>
                {t('AI 创新之旅')}
              </span>
            </h1>
            <p className='text-lg text-slate-600 mb-10 leading-relaxed'>
              {t(
                '注册即享统一的大模型接入网关，完善的额度管理与分发系统，让 AI 能力触手可及。',
              )}
            </p>

            <div className='grid grid-cols-2 gap-4'>
              <div className='p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group'>
                <div className='w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors duration-300'>
                  <IconLayers className='text-blue-600 group-hover:text-white transition-colors duration-300' size='large' />
                </div>
                <Text className='text-slate-900 font-semibold block text-base mb-1'>
                  {t('快速接入')}
                </Text>
                <Text className='text-slate-500 text-xs leading-relaxed block'>
                  {t('注册后立即可用')}
                </Text>
              </div>
              <div className='p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group'>
                <div className='w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-600 transition-colors duration-300'>
                  <IconActivity className='text-indigo-600 group-hover:text-white transition-colors duration-300' size='large' />
                </div>
                <Text className='text-slate-900 font-semibold block text-base mb-1'>
                  {t('清晰用量')}
                </Text>
                <Text className='text-slate-500 text-xs leading-relaxed block'>
                  {t('用量与成本可视')}
                </Text>
              </div>
              <div className='p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group'>
                <div className='w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center mb-3 group-hover:bg-cyan-600 transition-colors duration-300'>
                  <IconKey className='text-cyan-600 group-hover:text-white transition-colors duration-300' size='large' />
                </div>
                <Text className='text-slate-900 font-semibold block text-base mb-1'>
                  {t('统一密钥')}
                </Text>
                <Text className='text-slate-500 text-xs leading-relaxed block'>
                  {t('单密钥多模型')}
                </Text>
              </div>
              <div className='p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group'>
                <div className='w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3 group-hover:bg-emerald-600 transition-colors duration-300'>
                  <IconBolt className='text-emerald-600 group-hover:text-white transition-colors duration-300' size='large' />
                </div>
                <Text className='text-slate-900 font-semibold block text-base mb-1'>
                  {t('易于扩展')}
                </Text>
                <Text className='text-slate-500 text-xs leading-relaxed block'>
                  {t('随业务增长扩容')}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：注册表单区 - 纯白背景 */}
        <div className='flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12 bg-white relative register-right-panel'>
          <div className='w-full max-w-[400px] register-form-wrapper'>
            <div className='text-center mb-10 register-header-hero'>
              {/* <div className='flex items-center justify-center mb-6 gap-3 register-logo-header'>
                <img src={logo} alt='Logo' className='h-12 w-auto object-contain register-logo-img' style={{borderRadius: '0'}} />
                <Title heading={2} className='!text-gray-900 !text-2xl !font-bold !mb-0 register-system-name'>
                  {systemName}
                </Title>
              </div> */}
              <h2 className='text-2xl font-bold text-slate-800 mb-2 register-welcome-title'>{t('创建您的账户')}</h2>
              <p className='text-slate-500 text-sm register-welcome-subtitle'>{t('请填写下方信息以注册')}</p>
            </div>
            {showEmailRegister || !hasOAuthRegisterOptions
              ? renderEmailRegisterForm()
              : renderOAuthOptions()}
            {renderWeChatLoginModal()}

            {turnstileEnabled && (
              <div className='flex justify-center mt-6'>
                <Turnstile
                  sitekey={turnstileSiteKey}
                  onVerify={(token) => {
                    setTurnstileToken(token);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
