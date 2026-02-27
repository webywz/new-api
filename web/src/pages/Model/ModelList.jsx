import React from 'react';
import { Empty, Spin, Pagination } from '@douyinfe/semi-ui';
import { IllustrationNoResult, IllustrationNoResultDark } from '@douyinfe/semi-illustrations';
import ModelCard from './ModelCard';

const ModelList = ({
    models,
    vendorMap,
    loading,
    activePage,
    pageSize,
    modelCount,
    handlePageChange,
    handlePageSizeChange,
    t
}) => {
    if (loading && (!models || models.length === 0)) {
        return (
            <div className='model-list-loading flex justify-center items-center py-24'>
                <Spin size="large" />
            </div>
        );
    }

    if (!models || models.length === 0) {
        return (
            <div className='model-list-empty py-24 bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm backdrop-blur-md'>
                <Empty
                    image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
                    darkModeImage={<IllustrationNoResultDark style={{ width: 150, height: 150 }} />}
                    description={t('暂无可见的模型数据')}
                    className='model-list-empty-comp'
                />
            </div>
        );
    }

    return (
        <div className='model-list-container flex flex-col gap-8'>
            <div className='model-list-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'>
                {models.map(model => (
                    <ModelCard key={model.id} model={model} vendorMap={vendorMap} t={t} />
                ))}
            </div>

            {modelCount > 0 && (
                <div className='model-list-pagination flex justify-center sm:justify-end items-center py-4 px-6 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 backdrop-blur-md sticky bottom-4 z-20'>
                    <Pagination
                        className='model-list-pagination-comp'
                        total={modelCount}
                        currentPage={activePage}
                        pageSize={pageSize}
                        showSizeChanger
                        pageSizeOptions={[10, 20, 40, 60, 100]}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            )}
        </div>
    );
};

export default ModelList;
