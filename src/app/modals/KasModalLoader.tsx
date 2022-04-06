// A map of modal components to their lazy loaded implementations
import React from "react";

import { useTranslation } from "react-i18next";
import {
  CreateInstanceProps,
  CreateServiceAccountProps,
  DeleteInstanceProps,
  DeleteServiceAccountProps,
  ModalRegistry,
  ModalType,
  ResetServiceAccountCredentialsProps,
  useModal,
  TransferOwnershipProps,
} from "@rhoas/app-services-ui-shared";

export const useKasModals = (): ModalRegistry => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  return {
    [ModalType.KasCreateInstance]: {
      lazyComponent: React.lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/OpenshiftStreams/dialogs/CreateInstance/CreateInstance"
          )
      ) as React.LazyExoticComponent<
        React.FunctionComponent<CreateInstanceProps>
      >,
      variant: "medium",
      title: t("create_a_kafka_instance"),
    },
    [ModalType.KasDeleteInstance]: {
      lazyComponent: React.lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/OpenshiftStreams/dialogs/DeleteInstance/DeleteInstanceConnected"
          )
      ) as React.LazyExoticComponent<
        React.FunctionComponent<DeleteInstanceProps>
      >,
      variant: "small",
    },
    [ModalType.KasTransferOwnership]: {
      lazyComponent: React.lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/OpenshiftStreams/dialogs/TransferOwnership/TransferOwnership"
          )
      ) as React.LazyExoticComponent<
        React.FunctionComponent<TransferOwnershipProps>
      >,
      variant: "medium",
      title: t("change_owner"),
    },
    [ModalType.KasCreateServiceAccount]: {
      lazyComponent: React.lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/ServiceAccounts/dialogs/CreateServiceAccount/CreateServiceAccountConnected"
          )
      ) as React.LazyExoticComponent<
        React.FunctionComponent<CreateServiceAccountProps>
      >,
      variant: "medium",
      title: t("serviceAccount.create_a_service_account"),
    },
    [ModalType.KasDeleteServiceAccount]: {
      lazyComponent: React.lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/ServiceAccounts/dialogs/DeleteServiceAccount/DeleteServiceAccount"
          )
      ) as React.LazyExoticComponent<
        React.FunctionComponent<DeleteServiceAccountProps>
      >,
      title: t("serviceAccount.delete_service_account") + "?",
      variant: "small",
    },
    [ModalType.KasResetServiceAccountCredentials]: {
      lazyComponent: React.lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/ServiceAccounts/dialogs/ResetServiceAccountCredentials/ResetServiceAccountCredentials"
          )
      ) as React.LazyExoticComponent<
        React.FunctionComponent<ResetServiceAccountCredentialsProps>
      >,
      title: `${t("serviceAccount.reset_service_account_credentials")}?`,
      variant: "medium",
    },
  };
};

export const KasModalLoader: React.FunctionComponent = () => {
  const { registerModals } = useModal();
  const modals = useKasModals();
  registerModals(modals);
  return <></>;
};
