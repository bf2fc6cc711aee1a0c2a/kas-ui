import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, FormGroup, Select, SelectVariant, Modal, Button } from '@patternfly/react-core';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';
import { PrincipalType, usePrincipals } from '@rhoas/app-services-ui-shared';

export type ChangeOwnerModalProps = {
    kafka: KafkaRequest;
    onClose?: () => void;
    hideModal: () => void;

};

export const ChangeOwnerModal: React.FC<ChangeOwnerModalProps> = ({
    kafka,
    onClose,
    hideModal,

}) => {

    const { t } = useTranslation();

    const isModalOpen = true;

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleToggle = () => {
        hideModal();
        onClose && onClose();
    };

    const onToggle = () => {
        setIsOpen(true)
    }

    //const principals = usePrincipals().getAllPrincipals();

    //console.log(principals);

    return (
        <Modal title={t('change_owner')} isOpen={isModalOpen} onClose={handleToggle} variant="small"
            actions={[
                <Button key="changeowner" variant="primary" onClick={handleToggle}>Change owner</Button>,
                <Button key="cancel" variant="link" onClick={hideModal}>Cancel</Button>
            ]}>
            <Form>
                <FormGroup
                    fieldId='Current-owner-name'
                    label={t(
                        'current_owner_name'
                    )}>
                    {kafka?.owner}
                </FormGroup>
                <FormGroup fieldId='New-owner-name'
                    label={t('new_owner_name')}>
                    <Select
                        variant={SelectVariant.typeahead}
                        onToggle={onToggle}
                        isOpen={isOpen}
                        placeholderText="Select user account"
                        createText={"Use"}>

                    </Select>
                </FormGroup>
            </Form>
        </Modal>
    );
}

export default ChangeOwnerModal;