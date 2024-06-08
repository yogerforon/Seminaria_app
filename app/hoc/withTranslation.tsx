import React, { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

const withTranslation = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const WithTranslation: React.FC<P> = (props) => {
    const { t } = useTranslation();

    return <WrappedComponent {...props} t={t} />;
  };

  return WithTranslation;
};

export default withTranslation;