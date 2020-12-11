import React, { useState } from 'react';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  Button,
  ClipboardCopy,
  Checkbox,
  Divider,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  InputGroup,
  InputGroupText,
  TextInput,
  PageSection,
  PageSectionVariants,
  Popover,
  Radio,
  Select,
  SelectOption,
  SelectVariant,
  Split,
  SplitItem,
  Switch,
  Title,
  TextContent,
  Text,
  TextVariants,
  Wizard,
  WizardStep,
} from '@patternfly/react-core';
import { PlusCircleIcon, KeyIcon } from '@patternfly/react-icons';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Flex/flex.css';
import '@patternfly/react-styles/css/utilities/Sizing/sizing.css';
import './GenerateCredential.css';
import { useTranslation } from 'react-i18next';

const GenerateCredential: React.FunctionComponent = () => {
  const { t } = useTranslation();

  const [isCreated, setIsCreated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [stepNo, setStepNo] = useState(1);
  const [credentialNameInput, setCredentialNameInput] = useState();
  const [radio1Step1, setRadio1Step1] = useState(false);
  const [radio2Step1, setRadio2Step1] = useState(false);
  const [radio3Step1, setRadio3Step1] = useState(false);
  const [radio4Step1, setRadio4Step1] = useState(false);
  const [isTopicSwitchChecked, setIsTopicSwitchChecked] = useState(false);
  const [selectTopicAccess, setSelectTopicAccess] = useState('name');
  const [topicAccessInput, setTopicAccessInput] = useState();
  const [isConsumerSwitchChecked, setIsConsumerSwitchChecked] = useState(false);
  const [selectConsumerAccess, setSelectConsumerAccess] = useState('name');
  const [consumerAccessInput, setConsumerAccessInput] = useState();
  const [radio1Step4, setRadio1Step4] = useState(false);
  const [radio2Step4, setRadio2Step4] = useState(false);
  const [radio3Step4, setRadio3Step4] = useState(false);
  const [selectTransactionAccess, setSelectTransactionAccess] = useState('name');
  const [transactionAccessInput, setTransactionAccessInput] = useState();
  const [confirmationCheckbox, setConfirmationCheckbox] = useState(false);

  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(!isOpen);
    setIsCreated(!isCreated);
    setStepNo(1);
  };

  const onMove = (curr, prev) => {
    setStepNo(curr.id);
  };

  const handleTextInputChange1 = (credentialNameInput) => {
    setCredentialNameInput(credentialNameInput);
  };

  const handleChangeStep1 = (checked, event) => {
    setRadio1Step1(false);
    setRadio2Step1(false);
    setRadio3Step1(false);
    setRadio4Step1(false);

    const target = event.target;
    const value = target.type === 'radio' ? target.checked : target.value;
    const name = target.name;

    if (name === 'radio1-1') {
      setRadio1Step1(value);
    } else if (name === 'radio2-1') {
      setRadio2Step1(value);
    } else if (name === 'radio3-1') {
      setRadio3Step1(value);
    } else if (name === 'radio4-1') {
      setRadio4Step1(value);
    }
  };

  const handleTopicSwitchChange = (isTopicSwitchChecked) => {
    setIsTopicSwitchChecked(isTopicSwitchChecked);
  };

  const handleSelectChange2 = (event) => {
    setSelectTopicAccess(event);
  };

  const handleTextInputChange2 = (topicAccessInput) => {
    setTopicAccessInput(topicAccessInput);
  };

  const handleConsumerSwitchChange = (isConsumerSwitchChecked) => {
    setIsConsumerSwitchChecked(isConsumerSwitchChecked);
  };

  const handleSelectChange3 = (event) => {
    setSelectConsumerAccess(event);
  };

  const handleTextInputChange3 = (consumerAccessInput) => {
    setConsumerAccessInput(consumerAccessInput);
  };

  const handleChangeStep4 = (checked, event) => {
    setRadio1Step4(false);
    setRadio2Step4(false);
    setRadio3Step4(false);

    const target = event.target;
    const value = target.type === 'radio' ? target.checked : target.value;
    const name = target.name;

    if (name === 'radio1-4') {
      setRadio1Step4(value);
    } else if (name === 'radio2-4') {
      setRadio2Step4(value);
    } else if (name === 'radio3-4') {
      setRadio3Step4(value);
    }
  };

  const handleSelectChange4 = (event) => {
    setSelectTransactionAccess(event);
  };

  const handleTextInputChange4 = (transactionAccessInput) => {
    setTransactionAccessInput(transactionAccessInput);
  };

  const handleChangeCheckbox = (confirmationCheckbox) => {
    setConfirmationCheckbox(confirmationCheckbox);
  };

  const step1 = (
    <div className="generate-cred-wizard-content">
      <TextContent className="pf-u-mb-lg">
        <Text component={TextVariants.h2}>{t('basic_info')}</Text>
        <Text component={TextVariants.small}>{t('generate_credential_step1_title_description')}</Text>
      </TextContent>
      <Form>
        <FormGroup label={t('credential_name_form_label')} fieldId="simple-form-name" isRequired>
          <TextInput
            isRequired
            type="text"
            id="simple-form-name"
            name="simple-form-name"
            aria-describedby="simple-form-name-helper"
            value={credentialNameInput}
            onChange={handleTextInputChange1}
            placeholder={t('credential_name_form_input_placeholder')}
          />
        </FormGroup>
        <FormGroup
          label={t('credential_aplication_reason_form_label')}
          className="form-group-radio"
          fieldId="radio-access-type"
          isRequired
        >
          <Radio
            isChecked={radio1Step1}
            name="radio1-1"
            onChange={handleChangeStep1}
            label={t('produce_only')}
            id="radio-controlled-1"
            value="produce"
          />
          <Radio
            isChecked={radio2Step1}
            name="radio2-1"
            onChange={handleChangeStep1}
            label={t('consume_only')}
            id="radio-controlled-2"
            value="consume"
          />
          <Radio
            isChecked={radio3Step1}
            name="radio3-1"
            onChange={handleChangeStep1}
            label={t('produce_and_consume')}
            id="radio-controlled-3"
            value="produceconsume"
          />
          <Radio
            isChecked={radio4Step1}
            name="radio4-1"
            onChange={handleChangeStep1}
            label={t('produce_consume_and_create_topics')}
            id="radio-controlled-4"
            value="produceconsumecreate"
          />
        </FormGroup>
      </Form>
    </div>
  );

  const step2 = (
    <div className="generate-cred-wizard-content">
      <TextContent className="pf-u-mb-lg">
        <Text component={TextVariants.h2}>{t('generate_credential_step2_title_description')}</Text>
      </TextContent>
      <Form>
        <Switch
          id="simple-switch"
          label={t('all_topics')}
          labelOff={t('all_topics')}
          isChecked={isTopicSwitchChecked}
          onChange={handleTopicSwitchChange}
        />
        {isTopicSwitchChecked ? (
          <></>
        ) : (
          <FormGroup
            label={t('specific_topics')}
            fieldId="input-access-topics"
            isRequired
            // helperText="Please enter your topic name"
          >
            <Split hasGutter className="pf-u-align-items-center">
              <SplitItem>{t('topics_with_the')}</SplitItem>
              <SplitItem>
                <FormSelect id="select-access-topics" value={selectTopicAccess} onChange={handleSelectChange2}>
                  <FormSelectOption value="name" label={t('lower_name')} />
                  <FormSelectOption value="prefix" label={t('lower_prefix')} />
                </FormSelect>
              </SplitItem>
              <SplitItem isFilled>
                <TextInput
                  isRequired
                  type="text"
                  id="input-access-topics"
                  name="input-access-topics"
                  aria-describedby="simple-form-name-helper"
                  value={topicAccessInput}
                  onChange={handleTextInputChange2}
                  placeholder={`${t('enter_your_topic')} ${selectTopicAccess}`}
                />
              </SplitItem>
            </Split>
            <Popover position="bottom" bodyContent={<div>{t('credential_rule_popover_data')}</div>}>
              <Button variant="link" icon={<PlusCircleIcon />} isInline className="pf-u-mt-md">
                Add another rule
              </Button>
            </Popover>
          </FormGroup>
        )}
      </Form>
    </div>
  );

  const step3 = (
    <div className="generate-cred-wizard-content">
      <TextContent className="pf-u-mb-lg">
        <Text component={TextVariants.h2}>{t('generate_credential_step3_title_description')}</Text>
      </TextContent>
      <Form>
        <Switch
          id="simple-switch"
          label={t('all_consumer_groups')}
          labelOff={t('all_consumer_groups')}
          isChecked={isConsumerSwitchChecked}
          onChange={handleConsumerSwitchChange}
        />
        {isConsumerSwitchChecked ? (
          <></>
        ) : (
          <FormGroup label={t('specific_consumer_groups')} fieldId="input-access-consumers" isRequired>
            <Split hasGutter className="pf-u-align-items-center">
              <SplitItem>{t('groups_with_the')}</SplitItem>
              <SplitItem>
                <FormSelect id="select-access-consumers" value={selectConsumerAccess} onChange={handleSelectChange3}>
                  <FormSelectOption value="name" label={t('lower_name')} />
                  <FormSelectOption value="prefix" label={t('lower_prefix')} />
                </FormSelect>
              </SplitItem>
              <SplitItem isFilled>
                <TextInput
                  isRequired
                  type="text"
                  id="input-access-consumers"
                  name="input-access-consumers"
                  value={consumerAccessInput}
                  onChange={handleTextInputChange3}
                  placeholder={`${t('enter_your_consumer_group')} ${selectConsumerAccess}`}
                />
              </SplitItem>
            </Split>
          </FormGroup>
        )}
      </Form>
    </div>
  );

  const step4 = (
    <div className="generate-cred-wizard-content">
      <TextContent className="pf-u-mb-lg">
        <Text component={TextVariants.h2} id="step4-title">
          {t('generate_credential_step4_title_description')}
        </Text>
      </TextContent>
      <Form>
        <section aria-labelledby="step4-title" className="form-group-radio">
          <div className="pf-c-form__group-control">
            <Radio
              isChecked={radio1Step4}
              name="radio1-4"
              onChange={handleChangeStep4}
              label={t('no_transaction_ids')}
              id="radio-controlled-1-4"
              value="no"
            />
            <Radio
              isChecked={radio2Step4}
              name="radio2-4"
              onChange={handleChangeStep4}
              label={t('all_transaction_ids')}
              id="radio-controlled-2-4"
              value="all"
              className="pf-u-mb-sm"
            />
            <Split hasGutter className="pf-u-align-items-center">
              <SplitItem>
                <Radio
                  isChecked={radio3Step4}
                  name="radio3-4"
                  onChange={handleChangeStep4}
                  label={t('transaction_ids_with_the')}
                  id="radio-controlled-3-4"
                  value="filter"
                />
              </SplitItem>
              <SplitItem>
                <FormSelect
                  id="select-access-transactions"
                  value={selectTransactionAccess}
                  onChange={handleSelectChange4}
                >
                  <FormSelectOption value="name" label={t('lower_name')} />
                  <FormSelectOption value="prefix" label={t('lower_prefix')} />
                </FormSelect>
              </SplitItem>
              <SplitItem isFilled>
                <TextInput
                  isRequired
                  type="text"
                  id="input-access-transactions"
                  name="input-access-transactions"
                  value={transactionAccessInput}
                  onChange={handleTextInputChange4}
                  placeholder={`${t('enter_your_transaction_id')} ${selectTransactionAccess}`}
                />
              </SplitItem>
            </Split>
          </div>
        </section>
      </Form>
    </div>
  );

  const clientID = (
    <>
      <Alert variant="danger" isInline title="These credentials were not actually generated from this flow as it is part of the mock UI. For now, please go to the details tab to generate credentials." />
      <EmptyState variant={EmptyStateVariant.large}>
        <EmptyStateIcon icon={KeyIcon} />
        <Title headingLevel="h4" size="lg">
          {t('credential_successfully_generated')}
        </Title>
        <EmptyStateBody>{t('clientid_empty_state_body')}</EmptyStateBody>
        <InputGroup className="pf-u-mt-lg">
          <InputGroupText className="no-wrap">{t('client_id')}</InputGroupText>
          <ClipboardCopy isReadOnly className="pf-u-w-100">
            FSLG934JM98IL
          </ClipboardCopy>
        </InputGroup>
        <InputGroup className="pf-u-mt-md">
          <InputGroupText className="no-wrap">Client secret</InputGroupText>
          <ClipboardCopy isReadOnly className="pf-u-w-100">
            898VsyDInUfhSd9ng8K/REs9r8h0n8j98s5c4JdeJfUg/E8
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
        <Button variant="primary" isDisabled={!confirmationCheckbox} onClick={handleClose}>
          {t('close')}
        </Button>
      </EmptyState>
    </>
  );

  const steps: WizardStep[] = [
    { id: 1, name: t('basic_info'), component: step1, nextButtonText: t('next') },
    { id: 2, name: t('topics_access'), component: step2, nextButtonText: t('next') },
    { id: 3, name: t('consumer_groups_access'), component: step3, nextButtonText: t('next') },
    { id: 4, name: t('transaction_ids_access'), component: step4, nextButtonText: t('finish') },
    { id: 5, name: t('finish'), component: clientID, isFinishedStep: true },
  ];

  const title = t('generate_credential');

  return (
    <>
      {isCreated ? (
        <>
          <FlexItem className="pf-m-align-right pf-m-spacer-none">
            <Button variant="danger" onClick={handleModalToggle} className="pf-u-ml-md pf-u-mb-md">
              {t('generate_new_credential')}
            </Button>
          </FlexItem>
          <FlexItem className="pf-m-grow">
            <Alert variant="success" isInline title={t('credentials_successfully_generated')} />
          </FlexItem>
        </>
      ) : (
        <FlexItem className="pf-m-align-right">
          <Button variant="secondary" onClick={handleModalToggle} className="pf-u-ml-md">
            {t('generate_credential')}
          </Button>
        </FlexItem>
      )}
      <Wizard
        title={title}
        description={t('create_credential_wizard_description')}
        steps={steps}
        onNext={onMove}
        onBack={onMove}
        onClose={handleModalToggle}
        isOpen={isOpen}
        hideClose={stepNo === 5}
      />
    </>
  );
};

export { GenerateCredential };
