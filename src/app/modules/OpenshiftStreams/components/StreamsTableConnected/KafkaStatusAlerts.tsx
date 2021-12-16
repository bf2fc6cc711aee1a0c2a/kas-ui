import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlert, useAuth } from '@rhoas/app-services-ui-shared';
import {
  Configuration,
  DefaultApi,
  KafkaRequest,
} from '@rhoas/kafka-management-sdk';
import { usePageVisibility } from '@app/hooks/usePageVisibility';
import { InstanceStatus, MAX_POLL_INTERVAL } from '@app/utils';
import { AlertVariant } from '@patternfly/react-core';
import { useTimeout } from '@app/hooks/useTimeout';

export const KafkaStatusAlerts: React.FunctionComponent = () => {
  const { t } = useTranslation(['kasTemporaryFixMe']);
  const { addAlert } = useAlert() || {};
  const auth = useAuth();

  const [deletedKafkas, setDeletedKafkas] = useState<string[]>([]);
  const [currentUserKafkas, setCurrentUserKafkas] = useState<
    KafkaRequest[] | undefined
  >();
  const [items, setItems] = useState<Array<KafkaRequest>>([]);
  const [loggedInUser, setLoggedInUser] = useState<string | undefined>(
    undefined
  );
  const { isVisible } = usePageVisibility();
  const { apiBasePath: basePath } = kas || {};

  useEffect(() => {
    auth.getUsername()?.then((username) => setLoggedInUser(username));
  }, [auth]);

  const fetchCurrentUserKafkas = async () => {
    const accessToken = await auth?.kas.getToken();
    const filter = `owner = ${loggedInUser}`;
    if (accessToken && isVisible) {
      const apisService = new DefaultApi(
        new Configuration({
          accessToken,
          basePath,
        })
      );
      await apisService.getKafkas('', '', '', filter).then((res) => {
        const kafkaInstances = res.data;
        setCurrentUserKafkas(kafkaInstances.items);
      });
    }
  };

  useEffect(() => {
    loggedInUser && fetchCurrentUserKafkas();
  }, [loggedInUser]);

  useTimeout(() => fetchCurrentUserKafkas(), MAX_POLL_INTERVAL);

  const addAlertAfterSuccessDeletion = () => {
    const removeKafkaFromDeleted = (name: string) => {
      const index = deletedKafkas.findIndex((k) => k === name);
      if (index > -1) {
        const prev = Object.assign([], deletedKafkas);
        prev.splice(index, 1);
        setDeletedKafkas(prev);
      }
    };

    if (currentUserKafkas) {
      // filter all kafkas with status as deprovision
      const deprovisonedKafkas: KafkaRequest[] = currentUserKafkas.filter(
        (k) =>
          k.status === InstanceStatus.DEPROVISION ||
          k.status === InstanceStatus.DELETED
      );

      // filter all new kafka which is not in deleteKafka state
      const notPresentKafkas = deprovisonedKafkas
        .filter((k) => deletedKafkas.findIndex((dk) => dk === k.name) < 0)
        .map((k) => k.name || '');
      // create new array by merging old and new kafka with status as deprovion
      const allDeletedKafkas: string[] = [
        ...deletedKafkas,
        ...notPresentKafkas,
      ];
      // update deleteKafka with new arraycurrentUserkafkaInstanceItems
      setDeletedKafkas(allDeletedKafkas);

      // add alert for deleted kafkas which are completely deleted from the response
      allDeletedKafkas.forEach((k) => {
        const kafkaIndex = currentUserKafkas?.findIndex(
          (item) => item.name === k
        );
        if (kafkaIndex < 0) {
          removeKafkaFromDeleted(k);
          addAlert &&
            addAlert({
              title: t('kafka_successfully_deleted', { name: k }),
              variant: AlertVariant.success,
            });
        }
      });
    }
  };

  const addAlertAfterSuccessCreation = () => {
    const lastItemsState: KafkaRequest[] = JSON.parse(JSON.stringify(items));
    if (items && items.length > 0) {
      const completedOrFailedItems = Object.assign(
        [],
        currentUserKafkas
      ).filter(
        (item: KafkaRequest) =>
          item.status === InstanceStatus.READY ||
          item.status === InstanceStatus.FAILED
      );
      lastItemsState.forEach((item: KafkaRequest) => {
        const instances: KafkaRequest[] = completedOrFailedItems.filter(
          (cfItem: KafkaRequest) => item.id === cfItem.id
        );
        if (instances && instances.length > 0) {
          if (instances[0].status === InstanceStatus.READY) {
            addAlert &&
              addAlert({
                title: t('kafka_successfully_created'),
                variant: AlertVariant.success,
                description: (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('kafka_success_message', {
                        name: instances[0]?.name,
                      }),
                    }}
                  />
                ),
                dataTestId: 'toastCreateKafka-success',
              });
          } else if (instances[0].status === InstanceStatus.FAILED) {
            addAlert &&
              addAlert({
                title: t('kafka_not_created'),
                variant: AlertVariant.danger,
                description: (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('kafka_failed_message', {
                        name: instances[0]?.name,
                      }),
                    }}
                  />
                ),
                dataTestId: 'toastCreateKafka-failed',
              });
          }
        }
      });
    }
    const incompleteKafkas = Object.assign(
      [],
      currentUserKafkas?.filter(
        (item: KafkaRequest) =>
          item.status === InstanceStatus.PROVISIONING ||
          item.status === InstanceStatus.ACCEPTED
      )
    );
    setItems(incompleteKafkas);
  };

  // Redirect the user to a previous page if there are no kafka instances for a page number / size
  useEffect(() => {
    // handle success alert for deletion
    addAlertAfterSuccessDeletion();
    // handle success alert for creation
    addAlertAfterSuccessCreation();
  }, [currentUserKafkas]);

  return <></>;
};
