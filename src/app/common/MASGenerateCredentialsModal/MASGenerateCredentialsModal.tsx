import React, { useState, FunctionComponent, useContext, useEffect } from 'react';
import {
  Modal,
  ModalVariant,
  Bullseye,
  Button,
  ClipboardCopy,
  Checkbox,
  EmptyStateVariant,
  InputGroup,
  InputGroupText,
  TitleSizes,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import KeyIcon from '@patternfly/react-icons/dist/js/icons/key-icon';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Flex/flex.css';
import '@patternfly/react-styles/css/utilities/Sizing/sizing.css';
import { useTranslation } from 'react-i18next';
import { MASEmptyState, MASLoading } from '@app/common';
import './MASGenerateCredentialsModal.css';

type MASGenerateCredentialsModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  credential: any | undefined;
  setCredential: (credential: any) => void;
  isLoading?: boolean;
  title?: string;
};

const MASGenerateCredentialsModal: FunctionComponent<MASGenerateCredentialsModalProps> = ({
  isOpen,
  setIsOpen,
  credential,
  setCredential,
  isLoading,
  title,
}: MASGenerateCredentialsModalProps) => {
  const { t } = useTranslation();

  const [isCreated, setIsCreated] = useState(false);
  const [confirmationCheckbox, setConfirmationCheckbox] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setIsOpen(false);
    setIsCreated(!isCreated);
    setCredential(undefined);
    setConfirmationCheckbox(false);
  };

  const handleChangeCheckbox = (checked: boolean) => {
    setConfirmationCheckbox(checked);
  };

  const generateCredentials = (
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
          <Text component={TextVariants.small} className="pf-u-mt-lg">
            {t('connect_to_the_kafka_instance_using_this_clientID_and_secret')}
          </Text>
        </TextContent>
        <InputGroup className="pf-u-mt-lg">
          <InputGroupText className="mk--generate-credential__empty-state--input-group">
            {t('client_id')}
          </InputGroupText>
          <ClipboardCopy
            isReadOnly
            className="pf-u-w-100"
            data-testid="modalCredentials-copyClientID"
            textAriaLabel={t('client_id')}
          >
            {credential?.clientID}
          </ClipboardCopy>
        </InputGroup>
        <InputGroup className="pf-u-mt-md">
          <InputGroupText className="mk--generate-credential__empty-state--input-group">
            {t('common.client_secret')}
          </InputGroupText>
          <ClipboardCopy
            isReadOnly
            className="pf-u-w-100"
            data-testid="modalCredentials-copyClientSecret"
            textAriaLabel={t('common.client_secret')}
          >
            {credential?.clientSecret}
          </ClipboardCopy>
        </InputGroup>
        <TextContent>
          <Text component={TextVariants.small} className="pf-u-mt-lg">
            {t('create_service_account_credentials_warning_message')}
          </Text>
        </TextContent>
        <Bullseye className="pf-u-mt-lg">
          <Checkbox
            label={t('client_id_confirmation_checkbox_label')}
            isChecked={confirmationCheckbox}
            onChange={handleChangeCheckbox}
            id="check-1"
            name="check1"
          />
        </Bullseye>
        <Button
          variant="primary"
          isDisabled={!confirmationCheckbox}
          onClick={handleClose}
          data-testid="modalCredentials-buttonClose"
        >
          {t('close')}
        </Button>
      </MASEmptyState>
    </>
  );

  return (
    <Modal
      variant={ModalVariant.medium}
      title={title || t('serviceAccount.create_a_service_account')}
      isOpen={isOpen}
      onClose={handleClose}
      showClose={false}
    >
      {isLoading ? <MASLoading /> : generateCredentials}
    </Modal>
  );
};

export { MASGenerateCredentialsModal };
