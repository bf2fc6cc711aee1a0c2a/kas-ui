import React, { useEffect, useState } from 'react';
import { isMobileTablet } from '@app/utils';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';

export const MobileModalWrapper: React.FunctionComponent = ({ children }) => {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isMobileTablet()) {
      if (localStorage) {
        const count = parseInt(localStorage.getItem('openSessions') || '0');
        const newCount = count + 1;
        if (count < 1) {
          localStorage.setItem('openSessions', `${newCount}`);
          setIsMobileModalOpen(true);
        }
      }
    }
  }, []);

  const handleMobileModal = () => {
    setIsMobileModalOpen(!isMobileModalOpen);
  };

  return (
    <>
      {children}
      <Modal
        variant={ModalVariant.small}
        title='Mobile experience'
        isOpen={isMobileModalOpen}
        onClose={() => handleMobileModal()}
        actions={[
          <Button
            key='confirm'
            variant='primary'
            onClick={() => handleMobileModal()}
          >
            Ok
          </Button>,
        ]}
      >
        The mobile experience isn&apos;t fully optimized yet, so some items
        might not appear correctly.
      </Modal>
    </>
  );
};
