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

import React from 'react';
import {
  Avatar,
  Card,
  Tag,
  Divider,
  Typography,
  Badge,
} from '@douyinfe/semi-ui';
import {
  isRoot,
  isAdmin,
  renderQuota,
  stringToColor,
} from '../../../../helpers';
import { Coins, BarChart2, Users } from 'lucide-react';

const UserInfoHeader = ({ t, userState }) => {
  const getUsername = () => {
    if (userState.user) {
      return userState.user.username;
    } else {
      return 'null';
    }
  };

  const getAvatarText = () => {
    const username = getUsername();
    if (username && username.length > 0) {
      return username.slice(0, 2).toUpperCase();
    }
    return 'NA';
  };

  return (
    <Card
      className='user-info-header-card !rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 dark:border-slate-800'
      cover={
        <div
          className='user-info-cover relative h-36 md:h-48'
          style={{
            '--palette-primary-darkerChannel': '0 75 80',
            backgroundImage: `linear-gradient(0deg, rgba(var(--palette-primary-darkerChannel) / 80%), rgba(var(--palette-primary-darkerChannel) / 80%)), url('/cover-4.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* 用户信息内容 */}
          <div className='relative z-10 h-full flex flex-col justify-end p-6 md:p-8 bg-gradient-to-t from-black/60 to-transparent'>
            <div className='flex items-center'>
              <div className='flex items-stretch gap-4 md:gap-5 flex-1 min-w-0'>
                <Avatar
                  size='large'
                  color={stringToColor(getUsername())}
                  className='user-avatar border-2 border-white/20 shadow-lg'
                >
                  {getAvatarText()}
                </Avatar>
                <div className='flex-1 min-w-0 flex flex-col justify-end pb-1 gap-1 md:gap-2'>
                  <div
                    className='user-name text-2xl md:text-3xl lg:text-4xl font-bold truncate drop-shadow-md'
                    style={{ color: 'white' }}
                  >
                    {getUsername()}
                  </div>
                  <div className='flex flex-wrap items-center gap-2'>
                    {isRoot() ? (
                      <Tag
                        size='large'
                        shape='circle'
                        style={{ color: 'white' }}
                      >
                        {t('超级管理员')}
                      </Tag>
                    ) : isAdmin() ? (
                      <Tag
                        size='large'
                        shape='circle'
                        style={{ color: 'white' }}
                      >
                        {t('管理员')}
                      </Tag>
                    ) : (
                      <Tag
                        size='large'
                        shape='circle'
                        style={{ color: 'white' }}
                      >
                        {t('普通用户')}
                      </Tag>
                    )}
                    <Tag size='large' shape='circle' style={{ color: 'white' }}>
                      ID: {userState?.user?.id}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {/* 当前余额和桌面版统计信息 */}
      <div className='user-stats-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 p-2'>
        {/* 当前余额显示 */}
        <Badge count={t('当前余额')} position='rightTop' type='danger' className='balance-badge self-start sm:self-auto'>
          <div className='balance-amount text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent'>
            {renderQuota(userState?.user?.quota)}
          </div>
        </Badge>

        {/* 桌面版统计信息（Semi UI 卡片） */}
        <div className='hidden lg:block flex-shrink-0'>
          <Card
            size='small'
            className='stats-card !rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50'
            bodyStyle={{ padding: '16px 24px' }}
          >
            <div className='flex items-center gap-6'>
              <div className='stat-item flex items-center gap-2 group cursor-pointer'>
                <div className='p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm group-hover:scale-110 transition-transform duration-300'>
                  <Coins size={18} className='text-amber-500' />
                </div>
                <div className='flex flex-col'>
                  <Typography.Text size='small' type='tertiary' className='text-xs'>
                    {t('历史消耗')}
                  </Typography.Text>
                  <Typography.Text type='primary' strong className='text-sm'>
                    {renderQuota(userState?.user?.used_quota)}
                  </Typography.Text>
                </div>
              </div>
              <Divider layout='vertical' className='h-8' />
              <div className='stat-item flex items-center gap-2 group cursor-pointer'>
                <div className='p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm group-hover:scale-110 transition-transform duration-300'>
                  <BarChart2 size={18} className='text-blue-500' />
                </div>
                <div className='flex flex-col'>
                  <Typography.Text size='small' type='tertiary' className='text-xs'>
                    {t('历史消耗')}
                  </Typography.Text>
                  <Typography.Text size='small' type='tertiary' strong>
                    {renderQuota(userState?.user?.used_quota)}
                  </Typography.Text>
                </div>
                <Divider layout='vertical' />
                <div className='flex items-center gap-2'>
                  <BarChart2 size={16} />
                  <Typography.Text size='small' type='tertiary'>
                    {t('请求次数')}
                  </Typography.Text>
                  <Typography.Text type='primary' strong className='text-sm'>
                    {userState.user?.request_count || 0}
                  </Typography.Text>
                </div>
              </div>
              <Divider layout='vertical' className='h-8' />
              <div className='stat-item flex items-center gap-2 group cursor-pointer'>
                <div className='p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm group-hover:scale-110 transition-transform duration-300'>
                  <Users size={18} className='text-emerald-500' />
                </div>
                <div className='flex flex-col'>
                  <Typography.Text size='small' type='tertiary' className='text-xs'>
                    {t('用户分组')}
                  </Typography.Text>
                  <Typography.Text type='primary' strong className='text-sm'>
                    {userState?.user?.group || t('默认')}
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 移动端和中等屏幕统计信息卡片 */}
      <div className='lg:hidden mt-4'>
        <Card
          size='small'
          className='mobile-stats-card !rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50'
          bodyStyle={{ padding: '16px' }}
        >
          <div className='space-y-4'>
            <div className='stat-item-mobile flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-1.5 rounded-md bg-white dark:bg-slate-700 shadow-sm'>
                  <Coins size={16} className='text-amber-500' />
                </div>
                <Typography.Text size='small' type='tertiary' className='font-medium'>
                  {t('历史消耗')}
                </Typography.Text>
              </div>
              <Typography.Text type='primary' strong>
                {renderQuota(userState?.user?.used_quota)}
              </Typography.Text>
            </div>

            <div className='stat-item-mobile flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-1.5 rounded-md bg-white dark:bg-slate-700 shadow-sm'>
                  <BarChart2 size={16} className='text-blue-500' />
                </div>
                <Typography.Text size='small' type='tertiary' className='font-medium'>
                  {t('请求次数')}
                </Typography.Text>
              </div>
              <Typography.Text type='primary' strong>
                {userState.user?.request_count || 0}
              </Typography.Text>
            </div>

            <div className='stat-item-mobile flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-1.5 rounded-md bg-white dark:bg-slate-700 shadow-sm'>
                  <Users size={16} className='text-emerald-500' />
                </div>
                <Typography.Text size='small' type='tertiary' className='font-medium'>
                  {t('用户分组')}
                </Typography.Text>
              </div>
              <Typography.Text type='primary' strong>
                {userState?.user?.group || t('默认')}
              </Typography.Text>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default UserInfoHeader;
