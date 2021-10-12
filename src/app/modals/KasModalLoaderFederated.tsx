import React from "react";
import { I18nextProvider } from "react-i18next";
import { ModalProvider } from "@rhoas/app-services-ui-components";
import { KasModalLoader } from "@app/modals";
import { initI18N } from "@i18n/i18n";

const KasModalLoaderFederated: React.FC = ({ children }) => {
  return (
    <I18nextProvider i18n={initI18N()}>
      <ModalProvider>
        {children}
        <KasModalLoader />
      </ModalProvider>
    </I18nextProvider>
  );
};

export default KasModalLoaderFederated;
