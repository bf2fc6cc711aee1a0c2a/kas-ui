// A map of modal components to their lazy loaded implementations
import { FunctionComponent, LazyExoticComponent, lazy } from "react";

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
      lazyComponent: lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/OpenshiftStreams/dialogs/CreateInstance/CreateInstance"
          )
      ) as LazyExoticComponent<
        FunctionComponent<CreateInstanceProps>
      >,
      variant: "medium",
      title: t("create_a_kafka_instance"),
    },
    [ModalType.KasDeleteInstance]: {
      lazyComponent: lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/OpenshiftStreams/dialogs/DeleteInstance/DeleteInstanceConnected"
          )
      ) as LazyExoticComponent<
        FunctionComponent<DeleteInstanceProps>
      >,
      variant: "small",
    },
    [ModalType.KasTransferOwnership]: {
      lazyComponent: lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/OpenshiftStreams/dialogs/TransferOwnership/TransferOwnership"
          )
      ) as LazyExoticComponent<
        FunctionComponent<TransferOwnershipProps>
      >,
      variant: "medium",
      title: t("change_owner"),
    },
    [ModalType.KasCreateServiceAccount]: {
      lazyComponent: lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/ServiceAccounts/dialogs/CreateServiceAccount/CreateServiceAccountConnected"
          )
      ) as LazyExoticComponent<
        FunctionComponent<CreateServiceAccountProps>
      >,
      variant: "medium",
      title: t("serviceAccount.create_a_service_account"),
    },
    [ModalType.KasDeleteServiceAccount]: {
      lazyComponent: lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/ServiceAccounts/dialogs/DeleteServiceAccount/DeleteServiceAccount"
          )
      ) as LazyExoticComponent<
        FunctionComponent<DeleteServiceAccountProps>
      >,
      title: t("serviceAccount.delete_service_account") + "?",
      variant: "small",
    },
    [ModalType.KasResetServiceAccountCredentials]: {
      lazyComponent: lazy(
        () =>
          import(
            /* webpackPrefetch: true */ "@app/modules/ServiceAccounts/dialogs/ResetServiceAccountCredentials/ResetServiceAccountCredentials"
          )
      ) as LazyExoticComponent<
        FunctionComponent<ResetServiceAccountCredentialsProps>
      >,
      title: `${t("serviceAccount.reset_service_account_credentials")}?`,
      variant: "medium",
    },
  };
};

export const KasModalLoader: FunctionComponent = () => {
  const { registerModals } = useModal();
  const modals = useKasModals();
  registerModals(modals);
  return <></>;
};
