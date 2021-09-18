import React, { useState } from 'react';
import {
  Bullseye,
  Button,
  Checkbox,
  ClipboardCopy,
  EmptyStateVariant,
  InputGroup,
  InputGroupText,
  Modal,
  ModalVariant,
  Text,
  TextContent,
  TextVariants,
  TitleSizes,
} from '@patternfly/react-core';
import KeyIcon from '@patternfly/react-icons/dist/js/icons/key-icon';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Flex/flex.css';
import '@patternfly/react-styles/css/utilities/Sizing/sizing.css';
import { useTranslation } from 'react-i18next';
import { MASEmptyState, MASLoading, useRootModalContext } from '@app/common';
import { getModalAppendTo } from '@app/utils/utils';
import './CredentialsModal.css';
import { ServiceAccount } from '@rhoas/kafka-management-sdk';

const CredentialsModal: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { store, hideModal } = useRootModalContext();
  const { serviceAccount, isLoading: loading, title } = store?.modalProps || {};

  const handleClose = () => {
    hideModal();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title={title || t('serviceAccount.create_a_service_account')}
      isOpen={true}
      onClose={handleClose}
      showClose={false}
      appendTo={getModalAppendTo}
    >
      <Credentials
        loading={loading}
        serviceAccount={serviceAccount}
        close={hideModal}
      />
    </Modal>
  );
};

type CredentialsProps = {
  loading: boolean;
  serviceAccount: ServiceAccount;
  close: () => void;
};

const Credentials: React.FunctionComponent<CredentialsProps> = ({
  loading,
  serviceAccount,
  close,
}) => {
  const { t } = useTranslation();

  const [confirmationCheckbox, setConfirmationCheckbox] = useState(false);

  const confirm = (checked: boolean) => {
    setConfirmationCheckbox(checked);
  };

  if (loading) {
    return <MASLoading />;
  }
  return (
    <>
      <MASEmptyState
        emptyStateProps={{
          variant: EmptyStateVariant.large,
        }}
        emptyStateIconProps={{
          icon: KeyIcon,
        }}
        titleProps={{
          title: t('credentials_successfully_generated'),
          headingLevel: 'h2',
          size: TitleSizes.lg,
        }}
      >
        <TextContent>
          <Text component={TextVariants.small} className='pf-u-mt-lg'>
            {t('connect_to_the_kafka_instance_using_this_clientID_and_secret')}
          </Text>
        </TextContent>
        <InputGroup className='pf-u-mt-lg'>
          <InputGroupText className='mk--generate-credential__empty-state--input-group'>
            {t('client_id')}
          </InputGroupText>
          <ClipboardCopy
            isReadOnly
            className='pf-u-w-100'
            data-testid='modalCredentials-copyClientID'
            textAriaLabel={t('client_id')}
          >
            {serviceAccount?.client_id}
          </ClipboardCopy>
        </InputGroup>
        <InputGroup className='pf-u-mt-md'>
          <InputGroupText className='mk--generate-credential__empty-state--input-group'>
            {t('common.client_secret')}
          </InputGroupText>
          <ClipboardCopy
            isReadOnly
            className='pf-u-w-100'
            data-testid='modalCredentials-copyClientSecret'
            textAriaLabel={t('common.client_secret')}
          >
            {serviceAccount?.client_secret}
          </ClipboardCopy>
        </InputGroup>
        <TextContent>
          <Text component={TextVariants.small} className='pf-u-mt-lg'>
            {t('create_service_account_credentials_warning_message')}
          </Text>
        </TextContent>
        <Bullseye className='pf-u-mt-lg'>
          <Checkbox
            label={t('client_id_confirmation_checkbox_label')}
            isChecked={confirmationCheckbox}
            onChange={confirm}
            id='check-1'
            name='check1'
          />
        </Bullseye>
        <Button
          variant='primary'
          isDisabled={!confirmationCheckbox}
          onClick={close}
          data-testid='modalCredentials-buttonClose'
        >
          {t('close')}
        </Button>
      </MASEmptyState>
    </>
  );
};

export { CredentialsModal };

export default CredentialsModal;
