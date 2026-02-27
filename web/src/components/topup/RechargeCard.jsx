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

import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Typography,
  Tag,
  Card,
  Button,
  Banner,
  Skeleton,
  Form,
  Space,
  Row,
  Col,
  Spin,
  Tooltip,
  Tabs,
  TabPane,
} from '@douyinfe/semi-ui';
import { SiAlipay, SiWechat, SiStripe } from 'react-icons/si';
import {
  CreditCard,
  Coins,
  Wallet,
  BarChart2,
  TrendingUp,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useMinimumLoadingTime } from '../../hooks/common/useMinimumLoadingTime';
import { getCurrencyConfig } from '../../helpers/render';
import SubscriptionPlansCard from './SubscriptionPlansCard';

const { Text } = Typography;

const RechargeCard = ({
  t,
  enableOnlineTopUp,
  enableStripeTopUp,
  enableCreemTopUp,
  creemProducts,
  creemPreTopUp,
  presetAmounts,
  selectedPreset,
  selectPresetAmount,
  formatLargeNumber,
  priceRatio,
  topUpCount,
  minTopUp,
  renderQuotaWithAmount,
  getAmount,
  setTopUpCount,
  setSelectedPreset,
  renderAmount,
  amountLoading,
  payMethods,
  preTopUp,
  paymentLoading,
  payWay,
  userState,
  renderQuota,
  statusLoading,
  topupInfo,
  onOpenHistory,
  subscriptionLoading = false,
  subscriptionPlans = [],
  billingPreference,
  onChangeBillingPreference,
  activeSubscriptions = [],
  allSubscriptions = [],
  reloadSubscriptionSelf,
}) => {
  const onlineFormApiRef = useRef(null);
  const initialTabSetRef = useRef(false);
  const showAmountSkeleton = useMinimumLoadingTime(amountLoading);
  const [activeTab, setActiveTab] = useState('topup');
  const [selectedPayment, setSelectedPayment] = useState('');
  const shouldShowSubscription =
    !subscriptionLoading && subscriptionPlans.length > 0;

  useEffect(() => {
    if (payMethods && payMethods.length > 0 && !selectedPayment) {
      setSelectedPayment(payMethods[0].type);
    }
  }, [payMethods]);

  useEffect(() => {
    if (initialTabSetRef.current) return;
    if (subscriptionLoading) return;
    setActiveTab(shouldShowSubscription ? 'subscription' : 'topup');
    initialTabSetRef.current = true;
  }, [shouldShowSubscription, subscriptionLoading]);

  useEffect(() => {
    if (!shouldShowSubscription && activeTab !== 'topup') {
      setActiveTab('topup');
    }
  }, [shouldShowSubscription, activeTab]);
  const topupContent = (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
      {/* 左侧：账户概览 (5列) */}
      <div className='lg:col-span-5 space-y-6'>
        {/* 拟态信用卡 */}
        <div
          className='relative w-full aspect-[1.586/1] rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-300'
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          }}
        >
          {/* 装饰性光效 */}
          <div className='absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent blur-3xl pointer-events-none' />
          <div className='absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none' />
          
          <div className='relative h-full p-6 sm:p-8 flex flex-col justify-between text-white'>
            <div className='flex justify-between items-start'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center'>
                  <Wallet size={16} className='text-blue-300' />
                </div>
                <span className='font-medium text-blue-100/80 tracking-wider text-sm'>{t('PRO ACCOUNT')}</span>
              </div>
              <SiStripe size={24} className='opacity-50' />
            </div>

            <div>
              <div className='text-blue-200/60 text-xs font-medium mb-1 uppercase tracking-wider'>{t('Current Balance')}</div>
              <div className='text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-mono'>
                {renderQuota(userState?.user?.quota)}
              </div>
            </div>

            <div className='flex justify-between items-end'>
              <div>
                <div className='text-blue-200/60 text-[10px] font-medium uppercase tracking-wider mb-1'>{t('Card Holder')}</div>
                <div className='font-medium tracking-wide text-lg'>{userState?.user?.username}</div>
              </div>
              <div className='text-right'>
                 <div className='text-blue-200/60 text-[10px] font-medium uppercase tracking-wider mb-1'>{t('ID')}</div>
                 <div className='font-mono text-sm opacity-80'>#{userState?.user?.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 数据统计小卡片 */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow'>
            <div className='w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3 text-orange-500'>
              <TrendingUp size={20} />
            </div>
            <div className='text-gray-500 text-xs mb-1'>{t('历史消耗')}</div>
            <div className='text-gray-900 font-bold text-lg'>{renderQuota(userState?.user?.used_quota)}</div>
          </div>
          <div className='bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow'>
            <div className='w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3 text-purple-500'>
              <BarChart2 size={20} />
            </div>
            <div className='text-gray-500 text-xs mb-1'>{t('请求次数')}</div>
            <div className='text-gray-900 font-bold text-lg'>{userState?.user?.request_count || 0}</div>
          </div>
        </div>
      </div>

      {/* 右侧：充值操作 (7列) */}
      <Card 
        className='lg:col-span-7 !rounded-3xl !border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit' 
        bodyStyle={{ padding: '32px' }}
      >
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>{t('充值中心')}</h2>
          <p className='text-gray-500 text-sm'>{t('安全、快速地为您的账户充值')}</p>
        </div>

        {statusLoading ? (
          <div className='py-12 flex justify-center'>
            <Spin size='large' />
          </div>
        ) : enableOnlineTopUp || enableStripeTopUp || enableCreemTopUp ? (
          <Form
            getFormApi={(api) => (onlineFormApiRef.current = api)}
            initValues={{ topUpCount: topUpCount }}
          >
            <div className='space-y-8'>
              {(enableOnlineTopUp || enableStripeTopUp) && (
                <>
                  {/* 金额选择 */}
                  <div>
                    <div className='flex justify-between items-center mb-4'>
                      <label className='font-semibold text-gray-700'>{t('充值金额')}</label>
                      {(() => {
                        const { symbol, rate, type } = getCurrencyConfig();
                        if (type === 'USD') return null;
                        return (
                          <span className='text-xs bg-gray-100 px-2 py-1 rounded text-gray-500'>
                            1 $ ≈ {rate.toFixed(2)} {symbol}
                          </span>
                        );
                      })()}
                    </div>

                    <div className='grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4'>
                      {presetAmounts.map((preset, index) => {
                        const discount = preset.discount || topupInfo?.discount?.[preset.value] || 1.0;
                        const hasDiscount = discount < 1.0;
                        const { symbol, rate, type } = getCurrencyConfig();
                        const statusStr = localStorage.getItem('status');
                        let usdRate = 7;
                        try {
                          if (statusStr) {
                            const s = JSON.parse(statusStr);
                            usdRate = s?.usd_exchange_rate || 7;
                          }
                        } catch (e) { }

                        let displayValue = preset.value;
                        if (type === 'CNY') displayValue = preset.value * usdRate;
                        else if (type === 'CUSTOM') displayValue = preset.value * rate;

                        const isSelected = selectedPreset === preset.value;

                        return (
                          <div
                            key={index}
                            onClick={() => {
                              selectPresetAmount(preset);
                              onlineFormApiRef.current?.setValue('topUpCount', preset.value);
                            }}
                            className={`
                              relative cursor-pointer rounded-xl py-3 px-2 text-center transition-all duration-200 border
                              ${isSelected 
                                ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30 transform scale-105' 
                                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'}
                            `}
                          >
                            {hasDiscount && (
                              <div className={`absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm ${isSelected ? 'bg-white text-blue-600' : 'bg-green-500 text-white'}`}>
                                {t('惠')}
                              </div>
                            )}
                            <div className='font-bold text-lg leading-none'>
                              {formatLargeNumber(displayValue)}<span className='text-xs opacity-80 font-normal ml-0.5'>{symbol}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 自定义金额输入 */}
                    <div className='relative'>
                      <Form.InputNumber
                        field='topUpCount'
                        placeholder={t('输入自定义金额')}
                        disabled={!enableOnlineTopUp && !enableStripeTopUp}
                        min={minTopUp}
                        max={999999999}
                        step={1}
                        precision={0}
                        onChange={async (value) => {
                          if (value && value >= 1) {
                            setTopUpCount(value);
                            setSelectedPreset(null);
                            await getAmount(value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (!value || value < 1) {
                            setTopUpCount(1);
                            getAmount(1);
                          }
                        }}
                        className='!w-full !h-14 !rounded-xl !bg-gray-50 !border-transparent focus:!bg-white focus:!border-blue-500 !text-lg !font-medium !pl-4'
                        noLabel
                      />
                      <div className='absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none'>
                        <span className='text-sm text-gray-400'>{t('预计支付')}</span>
                        <Skeleton
                          loading={showAmountSkeleton}
                          active
                          placeholder={<div className='h-6 w-16 bg-gray-200 rounded'></div>}
                        >
                          <span className='text-xl font-bold text-gray-900'>{renderAmount()}</span>
                        </Skeleton>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Creem 套餐 (keep simplistic) */}
              {enableCreemTopUp && creemProducts.length > 0 && (
                <div>
                  <label className='font-semibold text-gray-700 block mb-3'>{t('会员套餐')}</label>
                  <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
                    {creemProducts.map((product, index) => (
                      <div
                        key={index}
                        onClick={() => creemPreTopUp(product)}
                        className='min-w-[140px] cursor-pointer rounded-xl border border-gray-200 p-3 hover:border-blue-500 hover:shadow-md transition-all bg-white flex flex-col justify-between h-24'
                      >
                        <div className='font-medium text-gray-900 truncate'>{product.name}</div>
                        <div>
                          <div className='text-xs text-gray-500'>{t('额度')}: {product.quota}</div>
                          <div className='text-blue-600 font-bold'>
                            {product.currency === 'EUR' ? '€' : '$'}{product.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 支付方式 */}
              {(enableOnlineTopUp || enableStripeTopUp) && (
                <div>
                  <label className='font-semibold text-gray-700 block mb-3'>{t('支付方式')}</label>
                  {payMethods && payMethods.length > 0 ? (
                    <div className='flex flex-wrap gap-3'>
                      {payMethods.map((payMethod) => {
                        const minTopupVal = Number(payMethod.min_topup) || 0;
                        const disabled = minTopupVal > Number(topUpCount || 0);
                        const isSelected = selectedPayment === payMethod.type;

                        return (
                          <div
                            key={payMethod.type}
                            onClick={() => !disabled && setSelectedPayment(payMethod.type)}
                            className={`
                              cursor-pointer rounded-full px-5 py-2.5 flex items-center gap-2 border transition-all duration-200
                              ${isSelected 
                                ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100' 
                                : disabled 
                                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                            `}
                          >
                            {payMethod.type === 'alipay' ? (
                              <SiAlipay size={18} color={isSelected ? '#2563EB' : '#1677FF'} />
                            ) : payMethod.type === 'wxpay' ? (
                              <SiWechat size={18} color={isSelected ? '#2563EB' : '#07C160'} />
                            ) : payMethod.type === 'stripe' ? (
                              <SiStripe size={18} color={isSelected ? '#2563EB' : '#635BFF'} />
                            ) : (
                              <CreditCard size={18} className={isSelected ? 'text-blue-600' : 'text-gray-500'} />
                            )}
                            <span className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                              {payMethod.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='text-gray-500 text-sm p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center'>
                      {t('暂无可用的支付方式')}
                    </div>
                  )}
                </div>
              )}

              <Button
                theme='solid'
                type='primary'
                className='w-full !rounded-xl !h-14 !text-lg !font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5'
                onClick={() => preTopUp(selectedPayment)}
                disabled={!selectedPayment || paymentLoading}
                loading={paymentLoading}
                style={{
                  background: 'linear-gradient(to right, #2563eb, #3b82f6)',
                }}
              >
                {t('立即充值')}
              </Button>
            </div>
          </Form>
        ) : (
          <div className='text-center text-gray-500 py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200'>
            <div className='mb-4 flex justify-center'>
              <div className='p-4 bg-white rounded-full shadow-sm'>
                <Wallet size={32} className='text-gray-300' />
              </div>
            </div>
            <p className='font-medium'>{t('暂无可用充值方式')}</p>
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div>
      {/* 顶部标题栏 - 透明背景 */}
      <div className='flex items-end justify-between mb-6 px-1'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-blue-50 rounded-xl text-blue-600'>
            <Wallet size={24} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>{t('我的钱包')}</h1>
            <p className='text-gray-500 text-sm mt-0.5'>{t('管理您的账户余额和充值记录')}</p>
          </div>
        </div>
        
        <Button
          theme='borderless'
          type='tertiary'
          className='!bg-white hover:!bg-gray-50 !border !border-gray-200 !text-gray-600 !rounded-xl !px-4 !h-10 shadow-sm'
          icon={<Receipt size={16} />}
          onClick={onOpenHistory}
        >
          {t('充值记录')}
        </Button>
      </div>

      {shouldShowSubscription ? (
        <Tabs 
          type='line' 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className='custom-tabs'
          contentStyle={{ marginTop: '24px' }}
        >
          <TabPane
            tab={
              <div className='flex items-center gap-2 px-2 py-1'>
                <Wallet size={16} />
                <span className='font-medium'>{t('余额充值')}</span>
              </div>
            }
            itemKey='topup'
          >
            {topupContent}
          </TabPane>
          <TabPane
            tab={
              <div className='flex items-center gap-2 px-2 py-1'>
                <Sparkles size={16} />
                <span className='font-medium'>{t('订阅套餐')}</span>
              </div>
            }
            itemKey='subscription'
          >
            <SubscriptionPlansCard
              t={t}
              loading={subscriptionLoading}
              plans={subscriptionPlans}
              payMethods={payMethods}
              enableOnlineTopUp={enableOnlineTopUp}
              enableStripeTopUp={enableStripeTopUp}
              enableCreemTopUp={enableCreemTopUp}
              billingPreference={billingPreference}
              onChangeBillingPreference={onChangeBillingPreference}
              activeSubscriptions={activeSubscriptions}
              allSubscriptions={allSubscriptions}
              reloadSubscriptionSelf={reloadSubscriptionSelf}
              withCard={false}
            />
          </TabPane>
        </Tabs>
      ) : (
        topupContent
      )}
    </div>
  );
};

export default RechargeCard;
