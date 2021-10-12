import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormGroup,
  Select,
  SelectVariant,
  Modal,
  Button,
  SelectOption,
  SelectOptionObject,
  AlertVariant,
  ModalVariant,
  Alert,
} from '@patternfly/react-core';
import {
  KafkaRequest,
  Configuration,
  DefaultApi,
  KafkaUpdateRequest,
} from '@rhoas/kafka-management-sdk';
import {
  Principal,
  useAuth,
  useConfig,
  useAlert,
} from '@rhoas/app-services-ui-shared';
import { isServiceApiError, ErrorCodes } from '@app/utils/error';
import { useFederated } from '@app/contexts';

export type TransferOwnershipProps = {
  kafka: KafkaRequest;
  refreshKafkas: () => void;
  onClose?: () => void;
  hideModal: () => void;
};

export const TransferOwnership: React.FC<TransferOwnershipProps> = ({
  kafka,
  onClose,
  hideModal,
  refreshKafkas,
}) => {
  const { t } = useTranslation();
  const { getAllUserAccounts } = useFederated() || {
    getAllUserAccounts: () => [],
  };
  const userAccounts = getAllUserAccounts && getAllUserAccounts();
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const { addAlert } = useAlert() || { addAlert: () => '' };

  //states
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selection, SetSelection] = useState();
  const [loading, setLoading] = useState<boolean>();
  const [errorCode, setErrorCode] = useState();

  const onCloseModal = () => {
    hideModal();
    onClose && onClose();
  };

  const onToggle = (isExpanded: boolean) => {
    setIsOpen(isExpanded);
  };

  const clearSelection = () => {
    SetSelection(undefined);
    setIsOpen(false);
  };

  const onSlect = (
    _,
    selection: string | SelectOptionObject,
    isPlaceholder: boolean | undefined
  ) => {
    if (isPlaceholder) {
      clearSelection();
    }
    SetSelection(selection);
    setIsOpen(false);
  };

  const onSubmitTransferOwnership = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken && selection?.trim() && kafka?.id) {
      setLoading(true);
      const kafkaUpdateRequest: KafkaUpdateRequest = { owner: selection };

      const apisService = new DefaultApi(
        new Configuration({
          accessToken,
          basePath,
        })
      );

      try {
        await apisService
          .updateKafkaById(kafka.id, kafkaUpdateRequest)
          .then(() => {
            refreshKafkas && refreshKafkas();
            addAlert({
              title: t('owner_change_sucess_title'),
              variant: AlertVariant.success,
              description: t('owner_change_sucess_message', {
                newOwner: selection,
                name: kafka?.name,
              }),
            });
            setLoading(false);
            onCloseModal();
          });
      } catch (error) {
        let code: string | undefined;
        if (isServiceApiError(error)) {
          code = error.response?.data.code;
        }
        setErrorCode(code);
        setLoading(false);
      }
    }
  };

  const renderAlert = () => {
    if (errorCode === ErrorCodes.OWNER_DOES_NOT_EXIST) {
      return (
        <Alert
          variant={AlertVariant.danger}
          aria-live='polite'
          isInline
          title={t('new_owner_does_not_exist_title')}
        >
          {t('new_owner_does_not_exist_message', { newOwner: selection })}
        </Alert>
      );
    } else if (errorCode) {
      return (
        <Alert
          variant={AlertVariant.danger}
          aria-live='polite'
          isInline
          title={t('common.something_went_wrong')}
        >
          {t('onwer_transfer_failed_message')}
        </Alert>
      );
    }
    return <></>;
  };

  return (
    <Modal
      id='manage-permissions-modal'
      title={t('change_owner')}
      isOpen={true}
      onClose={onCloseModal}
      variant={ModalVariant.medium}
      position='top'
      actions={[
        <Button
          key='changeowner'
          variant='primary'
          onClick={onSubmitTransferOwnership}
          isLoading={loading}
          isDisabled={!selection?.trim() || loading}
        >
          {t('common.change_owner')}
        </Button>,
        <Button key='cancel' variant='link' onClick={onCloseModal}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form>
        {renderAlert()}
        <FormGroup fieldId='Current-owner-name' label={t('current_owner_name')}>
          {kafka?.owner}
        </FormGroup>
        <FormGroup fieldId='New-owner-name' label={t('new_owner_name')}>
          <Select
            variant={SelectVariant.typeahead}
            onToggle={onToggle}
            isOpen={isOpen}
            placeholderText={t('select_user_account')}
            createText={t('common.use')}
            menuAppendTo='parent'
            maxHeight={400}
            onSelect={onSlect}
            selections={selection}
            isCreatable
          >
            {userAccounts?.map((userAccount: Principal) => {
              const { id, displayName } = userAccount;
              return (
                <SelectOption key={id} value={id} description={displayName}>
                  {id}
                </SelectOption>
              );
            })}
          </Select>
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default TransferOwnership;
