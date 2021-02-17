import React from 'react';
import { DropdownItem, Dropdown, KebabToggle, DropdownPosition, Tooltip } from '@patternfly/react-core';
import { KafkaRequest } from 'src/openapi';
import { useTranslation } from 'react-i18next';
import { InstanceStatus } from '@app/utils';
interface IStreamsActionResolverProps {
  selectedActionInstanceName?: string;
  setSelectedActionInstanceName: (kafka?: string) => void;
  rowData: KafkaRequest;
  loggedInUser?: string;
  onSelect: (event: any, originalData: KafkaRequest, selectedOption: string, rowIndex: number | undefined) => void;
  dropdownItems?: JSX.Element[];
  rowIndex: number;
}
const StreamsActionResolver: React.FC<IStreamsActionResolverProps> = ({
  selectedActionInstanceName,
  setSelectedActionInstanceName,
  rowData,
  onSelect,
  loggedInUser,
  rowIndex,
}) => {
  const { t } = useTranslation();

  const onSelectHandler = (event) => {
    const option = event.target.value;
    if (option) {
      onSelect(event, rowData, option, rowIndex);
    }
  };

  const onToggleHandler = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedActionInstanceName(undefined);
    } else setSelectedActionInstanceName(rowData?.name);
  };

  const dropdownItems = [
    <DropdownItem key="detail" value="view-instance" component="button">
      {t('view_details')}
    </DropdownItem>,
    <DropdownItem key="connect" value="connect-instance" component="button">
      {t('connect_to_instance')}
    </DropdownItem>,
    rowData?.owner !== loggedInUser ? (
      <Tooltip key="tooltip-delete" position="left" content={<div>{t('no_permission_to_delete_kafka')}</div>}>
        <DropdownItem
          key="delete"
          value="delete-instance"
          component="button"
          isDisabled={rowData?.owner != loggedInUser}
        >
          {t('delete_instance')}
        </DropdownItem>
      </Tooltip>
    ) : (
      <DropdownItem key="delete" value="delete-instance" component="button" isDisabled={rowData?.owner != loggedInUser}>
        {t('delete_instance')}
      </DropdownItem>
    ),
  ];
  return (
    <>
      {rowData?.status !== InstanceStatus.DEPROVISION && (
        <Dropdown
          key={`mas-kebab-dropdown-${rowIndex}`}
          onSelect={onSelectHandler}
          position={DropdownPosition.right}
          toggle={<KebabToggle onToggle={onToggleHandler} key={`mas-action-resolver-${rowData?.name}`} />}
          isOpen={rowData?.name === selectedActionInstanceName}
          isPlain
          dropdownItems={dropdownItems}
        />
      )}
    </>
  );
};

export default React.memo(StreamsActionResolver);
