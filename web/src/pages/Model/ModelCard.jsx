import React from 'react';
import { Tag, Typography, Tooltip } from '@douyinfe/semi-ui';
import { getLobeHubIcon, stringToColor } from '../../helpers';
import { renderLimitedItems } from '../../components/common/ui/RenderUtils';

const { Text, Paragraph } = Typography;

const ModelCard = ({ model, vendorMap, t }) => {
    const iconKey = model.icon || vendorMap[model.vendor_id]?.icon || 'Layers';
    const vendor = vendorMap[model.vendor_id];

    const renderTags = (text) => {
        if (!text) return null;
        const tagsArr = text.split(',').filter(Boolean);
        return renderLimitedItems({
            items: tagsArr,
            renderItem: (tag, idx) => (
                <Tag key={idx} size='small' shape='circle' color={stringToColor(tag)} className='model-card-tag mr-1 mt-1 font-medium'>
                    {tag}
                </Tag>
            ),
        });
    };


    const renderQuotaTypes = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) return null;
        return renderLimitedItems({
            items: arr,
            renderItem: (qt, idx) => {
                if (qt === 1) {
                    return (
                        <Tag key={`qt-${idx}`} color='teal' size='small' shape='circle' className='model-card-quota-tx font-medium'>
                            {t('按次计费')}
                        </Tag>
                    );
                }
                if (qt === 0) {
                    return (
                        <Tag key={`qt-${idx}`} color='violet' size='small' shape='circle' className='model-card-quota-token font-medium'>
                            {t('按量计费')}
                        </Tag>
                    );
                }
                return (
                    <Tag key={`qt-${idx}`} color='white' size='small' shape='circle' className='model-card-quota-other font-medium border border-gray-200'>
                        {qt}
                    </Tag>
                );
            },
            maxDisplay: 3,
        });
    };

    return (
        <div className='model-card-wrapper bg-white/80 dark:bg-gray-800/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full relative overflow-hidden backdrop-blur-lg group'>
            {/* 毛玻璃态背景光晕 */}
            <div className="model-card-glow absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>

            <div className='model-card-header flex justify-between items-start mb-4 z-10'>
                <div className='model-card-title-col flex items-center gap-3 w-full pr-2'>
                    <div className='model-card-icon-container flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-600/50'>
                        {getLobeHubIcon(iconKey, 24)}
                    </div>
                    <div className='model-card-name-info flex flex-col min-w-0'>
                        <Tooltip content={model.model_name}>
                            <Text className='model-card-name text-lg font-semibold text-gray-900 dark:text-gray-100 truncate w-full block leading-tight'>
                                {model.model_name}
                            </Text>
                        </Tooltip>
                        {vendor && (
                            <div className='model-card-vendor-badge flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1'>
                                {getLobeHubIcon(vendor.icon || 'Layers', 12)}
                                <span className='model-card-vendor-name ml-1 truncate max-w-[120px]'>{vendor.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='model-card-body flex-1 z-10 flex flex-col'>
                <Paragraph className='model-card-description text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed min-h-[40px]'>
                    {model.description || t('暂无详细描述')}
                </Paragraph>

                <div className='model-card-meta flex flex-col gap-2 mt-auto mb-4'>
                    {model.tags && (
                        <div className='model-card-tags-row flex flex-wrap'>
                            {renderTags(model.tags)}
                        </div>
                    )}

                </div>
            </div>

            <div className='model-card-footer mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center z-10'>
                <div className='model-card-quotas flex items-center gap-1.5'>
                    {renderQuotaTypes(model.quota_types)}
                </div>
                <div className='model-card-sync-status flex items-center justify-center w-6 h-6'>
                    {model.sync_official === 1 && (
                        <Tooltip content={t('参与官方同步')}>
                            <div className='model-card-sync-badge w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' />
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModelCard;
