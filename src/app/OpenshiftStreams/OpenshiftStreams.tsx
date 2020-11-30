import React, { useContext, useEffect, useState } from 'react';
import { Level, LevelItem, PageSection, PageSectionVariants, Spinner, Switch, Title } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { StreamsTableView } from '../components/StreamsTableView/StreamsTableView';
import { CreateInstanceModal } from '../components/CreateInstanceModal/CreateInstanceModal';
import { DefaultApi, KafkaRequest, KafkaRequestList } from '../../openapi/api';
import { AuthContext } from '@app/auth/AuthContext';
import { BASE_PATH } from '@app/common/app-config';

type OpenShiftStreamsProps = {
  onConnectToInstance: (data: KafkaRequest) => void;
}

const OpenshiftStreams = ({ onConnectToInstance }: OpenShiftStreamsProps) => {
  const { token } = useContext(AuthContext);

  const { t } = useTranslation();

  // States
  const [createStreamsInstance, setCreateStreamsInstance] = useState(false);
  const [kafkaDataLoaded, setKafkaDataLoaded] = useState(false);
  const [kafkaInstancesList, setKafkaInstancesList] = useState<KafkaRequestList>({} as KafkaRequestList);
  const [kafkaInstanceItems, setKafkaInstanceItems] = useState<KafkaRequest[]>([]); // Change this to 0 if you are working on the empty state
  const [mainToggle, setMainToggle] = useState(false);


  // Api Service
  const apisService = new DefaultApi({
    accessToken: token,
    basePath: BASE_PATH
  });

  // Functions
  const fetchKafkas = async () => {
    try {
      await apisService.listKafkas().then((res) => {
        const kafkaInstances = res.data;
        console.log('what is res' + JSON.stringify(kafkaInstances));
        setKafkaInstancesList(kafkaInstances);
        setKafkaInstanceItems(kafkaInstances.items);
      }).then(() => setTimeout(fetchKafkas, 2000));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token !== '') {
      setKafkaDataLoaded(false);
      fetchKafkas().then(() => setKafkaDataLoaded(true));

    }
  }, [token]);

  if (token === '') {
    return <Spinner />;
  }

  if (!kafkaDataLoaded) {
    return <Spinner />;
  }

  const handleSwitchChange = () => {
    setMainToggle(!mainToggle);
  };

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Level>
          <LevelItem>
            <Title headingLevel="h1" size="lg">
              {t('OpenshiftStreams')}
            </Title>
          </LevelItem>
          <LevelItem>
            <Switch
              id="simple-switch"
              label={t('Mock UI')}
              labelOff={t('Currently supported UI')}
              isChecked={mainToggle}
              onChange={() => handleSwitchChange()}
            />
          </LevelItem>
        </Level>
      </PageSection>
      <PageSection>
        {kafkaInstanceItems.length > 0 ? (
          <StreamsTableView kafkaInstanceItems={kafkaInstanceItems} mainToggle={mainToggle}
                            onConnectToInstance={onConnectToInstance} />
        ) : (
          <EmptyState
            createStreamsInstance={createStreamsInstance}
            setCreateStreamsInstance={setCreateStreamsInstance}
            mainToggle={mainToggle}
          />
        )}
        {createStreamsInstance && (
          <CreateInstanceModal
            createStreamsInstance={createStreamsInstance}
            setCreateStreamsInstance={setCreateStreamsInstance}
            mainToggle={mainToggle}
          />
        )}
      </PageSection>
    </>
  );
};

export { OpenshiftStreams };
