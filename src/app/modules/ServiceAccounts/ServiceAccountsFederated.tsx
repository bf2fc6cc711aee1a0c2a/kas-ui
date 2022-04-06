import { FC } from "react";
import { ServiceAccounts } from "./ServiceAccounts";
import { ModalProvider } from "@rhoas/app-services-ui-components";
import { KasModalLoader } from "@app/modals";

// Federation version of ServiceAccounts

const ServiceAccountsFederated: FC = () => {
  return (
    <ModalProvider>
      <ServiceAccounts />
      <KasModalLoader />
    </ModalProvider>
  );
};

export default ServiceAccountsFederated;
