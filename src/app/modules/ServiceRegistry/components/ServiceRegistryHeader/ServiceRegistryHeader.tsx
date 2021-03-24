import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Level,
  LevelItem,
  TextContent,
  Text,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';

export type ServiceRegistryHeaderProps = {
  name: string;
  onConnectToRegistry: (data: any) => void;
  onDeleteRegistry: (name: string) => void;
};

export const ServiceRegistryHeader: React.FC<ServiceRegistryHeaderProps> = ({
  name,
  onConnectToRegistry,
  onDeleteRegistry,
}: ServiceRegistryHeaderProps) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState<boolean>();

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSelect = () => {
    setIsOpen(!isOpen);
  };

  const dropdownItems = [
    <DropdownItem key="connect-registry" onClick={() => onConnectToRegistry(name)}>
      {t('serviceRegistry.connect_to_registry')}
    </DropdownItem>,
    <DropdownItem key="delete-registry" onClick={() => onDeleteRegistry(name)}>
      {t('serviceRegistry.delete_registry')}
    </DropdownItem>,
  ];

  return (
    <Level>
      <LevelItem>
        <TextContent>
          <Text component="h1"> {t('serviceRegistry.service_registry')}</Text>
        </TextContent>
      </LevelItem>
      <LevelItem>
        <Dropdown
          onSelect={onSelect}
          toggle={<KebabToggle onToggle={onToggle} id="toggle-service-registry" />}
          isOpen={isOpen}
          isPlain
          dropdownItems={dropdownItems}
          position={DropdownPosition.right}
        />
      </LevelItem>
    </Level>
  );
};
