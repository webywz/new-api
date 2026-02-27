import React from 'react';
import { Typography } from '@douyinfe/semi-ui';
import { useModelsData } from '../../hooks/models/useModelsData';
import ModelList from './ModelList';
import ModelsFilters from '../../components/table/models/ModelsFilters';

const { Title } = Typography;

const ModelPage = () => {
  const modelsData = useModelsData();
  const {
    t,
    models,
    vendorMap,
    loading,
    activePage,
    pageSize,
    modelCount,
    handlePageChange,
    handlePageSizeChange,
    formInitValues,
    setFormApi,
    searchModels,
    searching,
  } = modelsData;

  return (
    <div className='model-page-wrapper mt-[60px] px-4 md:px-8 py-8 max-w-[1800px] mx-auto min-h-[calc(100vh-60px)]'>
      <div className='model-page-header flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 z-30 relative'>
        <div className='model-page-title-section flex-shrink-0'>
          <Title heading={2} className='model-page-title m-0 text-gray-900 dark:text-gray-100 font-bold tracking-tight'>
            {t('模型列表')}
          </Title>
          <div className='model-page-subtitle text-base text-gray-500 dark:text-gray-400 mt-2 font-medium'>
            {t('浏览及检视所有的 AI 模型服务')}
          </div>
        </div>

        <div className='model-page-filters-section w-full lg:w-auto bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-3 rounded-2xl shadow-sm border border-gray-100/50 dark:border-gray-700/50 transition-all'>
          <ModelsFilters
            formInitValues={formInitValues}
            setFormApi={setFormApi}
            searchModels={searchModels}
            loading={loading}
            searching={searching}
            t={t}
          />
        </div>
      </div>

      <div className='model-page-content-section relative z-10'>
        <ModelList
          models={models}
          vendorMap={vendorMap}
          loading={loading}
          activePage={activePage}
          pageSize={pageSize}
          modelCount={modelCount}
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          t={t}
        />
      </div>
    </div>
  );
};

export default ModelPage;
