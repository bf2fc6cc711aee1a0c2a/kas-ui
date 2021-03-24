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
} from '@patternfly/react-core';
import KeyIcon from '@patternfly/react-icons/dist/js/icons/key-icon';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Flex/flex.css';
import '@patternfly/react-styles/css/utilities/Sizing/sizing.css';
import { useTranslation } from 'react-i18next';
// import { ApiContext } from '@app/api/ApiContext';
// import { AuthContext } from '@app/auth/AuthContext';
// import { isServiceApiError } from '@app/utils/error';
// import { DefaultApi, ServiceAccountRequest } from '../../../openapi/api';
import { MASEmptyState } from '@app/common';
import './MASGenerateCredentialsModal.css';

type MASGenerateCredentialsModalProps = {
  instanceName?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  credential: any | undefined;
  setCredential: (credential: any) => void;
};

const MASGenerateCredentialsModal: FunctionComponent<MASGenerateCredentialsModalProps> = ({
  isOpen,
  setIsOpen,
  credential,
  setCredential
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

  const handleChangeCheckbox = (confirmationCheckbox) => {
    setConfirmationCheckbox(confirmationCheckbox);
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
          headingLevel: 'h4',
          size: TitleSizes.lg,
        }}
        emptyStateBodyProps={{
          body: t('connect_to_the_kafka_instance_using_this_clientID_and_secret'),
        }}
      >
        <InputGroup className="pf-u-mt-lg">
          <InputGroupText className="mk--generate-credential__empty-state--input-group">
            {t('client_id')}
          </InputGroupText>
          <ClipboardCopy isReadOnly className="pf-u-w-100" data-testid="modalCredentials-copyClientID">
            {credential?.clientID}
          </ClipboardCopy>
        </InputGroup>
        <InputGroup className="pf-u-mt-md">
          <InputGroupText className="mk--generate-credential__empty-state--input-group">Client secret</InputGroupText>
          <ClipboardCopy isReadOnly className="pf-u-w-100" data-testid="modalCredentials-copyClientSecret">
            {credential?.clientSecret}
          </ClipboardCopy>
        </InputGroup>
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
      variant={ModalVariant.small}
      title="Create a service account"
      isOpen={isOpen}
      onClose={handleClose}
    >
      {generateCredentials}
    </Modal>
  );
};

export { MASGenerateCredentialsModal };
