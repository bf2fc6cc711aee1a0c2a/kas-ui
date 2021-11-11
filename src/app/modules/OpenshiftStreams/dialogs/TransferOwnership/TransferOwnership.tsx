import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  AlertVariant,
  Button,
  Form,
  FormGroup,
  Modal,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
} from '@patternfly/react-core';
import {
  Configuration,
  DefaultApi,
  KafkaRequest,
  KafkaUpdateRequest,
} from '@rhoas/kafka-management-sdk';
import {
  BaseModalProps,
  Principal,
  useAlert,
  useAuth,
  useConfig,
} from '@rhoas/app-services-ui-shared';
import { ErrorCodes, isServiceApiError } from '@app/utils/error';
import { useFederated } from '@app/contexts';

export type TransferOwnershipProps = {
  kafka: KafkaRequest;
  refreshKafkas: () => void;
  onClose?: () => void;
  hideModal: () => void;
};

export const TransferOwnership: React.FC<
  TransferOwnershipProps & BaseModalProps
> = ({ kafka, onClose, hideModal, refreshKafkas, variant, title }) => {
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
  const [selection, setSelection] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>();
  const [errorCode, setErrorCode] = useState<string | undefined>();

  const options = userAccounts?.map((userAccount: Principal) => {
    const { id, displayName } = userAccount;
    return (
      <SelectOption key={id} value={id} description={displayName}>
        {id}
      </SelectOption>
    );
  });

  const onCloseModal = () => {
    hideModal();
    onClose && onClose();
  };

  const onToggle = (isExpanded: boolean) => {
    setIsOpen(isExpanded);
  };

  const clearSelection = () => {
    setSelection(undefined);
    setIsOpen(false);
  };

  const onSelect = (
    _,
    selection: string | SelectOptionObject,
    isPlaceholder: boolean | undefined
  ) => {
    if (isPlaceholder) {
      clearSelection();
    }
    setSelection(selection.toString());
    setIsOpen(false);
  };

  const customFilter = (_, value: string) => {
    if (!value) {
      return options;
    }
    const input = new RegExp(value, 'i');
    return options?.filter(
      (userAccount) =>
        input.test(userAccount.props.value) ||
        input.test(userAccount.props.description)
    );
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
    let title, description;
    if (errorCode === ErrorCodes.OWNER_DOES_NOT_EXIST) {
      title = t('new_owner_does_not_exist_title');
      description = t('new_owner_does_not_exist_message', {
        newOwner: selection,
      });
    } else if (errorCode) {
      title = t('can_not_change_owner_title');
      description = t('onwer_transfer_failed_message', { name: kafka?.name });
    }

    if (title && description) {
      return (
        <Alert
          variant={AlertVariant.danger}
          aria-live='polite'
          isInline
          title={title}
        >
          {description}
        </Alert>
      );
    }

    return <></>;
  };

  return (
    <Modal
      id='manage-permissions-modal'
      title={title}
      isOpen={true}
      onClose={onCloseModal}
      variant={variant}
      position='top'
      actions={[
        <Button
          id='confirm__button'
          key='changeowner'
          variant='primary'
          onClick={onSubmitTransferOwnership}
          isLoading={loading}
          isDisabled={!selection?.trim() || loading}
        >
          {t('common.change_owner')}
        </Button>,
        <Button
          id='cancel__button'
          key='cancel'
          variant='link'
          onClick={onCloseModal}
        >
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
            id='manage-permissions-owner-select'
            variant={SelectVariant.typeahead}
            onToggle={onToggle}
            isOpen={isOpen}
            placeholderText={t('select_user_account')}
            createText={t('common.use')}
            menuAppendTo='parent'
            maxHeight={400}
            onSelect={onSelect}
            selections={selection}
            isCreatable
            onFilter={customFilter}
          >
            {options}
          </Select>
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default TransferOwnership;
