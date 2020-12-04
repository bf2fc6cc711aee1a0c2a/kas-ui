import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Level, LevelItem, PageSection, PageSectionVariants, Switch, Title } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { StreamsTableView } from '../components/StreamsTableView/StreamsTableView';
import { CreateInstanceModal } from '../components/CreateInstanceModal/CreateInstanceModal';
import { DefaultApi, KafkaRequest, KafkaRequestList } from '../../openapi/api';
import { AuthContext } from '@app/auth/AuthContext';
import { BASE_PATH } from '@app/common/app-config';
import { Loading } from '@app/components/Loading';

type OpenShiftStreamsProps = {
  onConnectToInstance: (data: KafkaRequest) => void;
};

const OpenshiftStreams = ({ onConnectToInstance }: OpenShiftStreamsProps) => {
  const { token } = useContext(AuthContext);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 10;

  // Api Service
  const apisService = new DefaultApi({
    accessToken: token,
    basePath: BASE_PATH,
  });

  const { t } = useTranslation();

  // States
  const [createStreamsInstance, setCreateStreamsInstance] = useState(false);
  const [kafkaInstanceItems, setKafkaInstanceItems] = useState<KafkaRequest[]>([]);
  const [kafkaDataLoaded, setKafkaDataLoaded] = useState(false);
  const [kafkaInstancesList, setKafkaInstancesList] = useState<KafkaRequestList>({} as KafkaRequestList);
  const [mainToggle, setMainToggle] = useState(false);

  // Functions
  const fetchKafkas = async () => {
    try {
      await apisService
        .listKafkas(page?.toString(), perPage?.toString())
        .then((res) => {
          const kafkaInstances = res.data;
          console.log('what is res' + JSON.stringify(kafkaInstances));
          setKafkaInstancesList(kafkaInstances);
          setKafkaInstanceItems(kafkaInstances.items);
        })
        .then(() => setTimeout(fetchKafkas, 2000));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token !== undefined || token !== '') {
      setKafkaDataLoaded(false);
      fetchKafkas().then(() => setKafkaDataLoaded(true));
    }
  }, [token]);

  if (!kafkaDataLoaded || token === '' || token === undefined) {
    return <Loading />;
  }

  const handleSwitchChange = (checked: boolean) => {
    setMainToggle(checked);
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
              onChange={handleSwitchChange}
            />
          </LevelItem>
        </Level>
      </PageSection>
      <PageSection>
        {kafkaInstanceItems.length > 0 ? (
          <StreamsTableView
            kafkaInstanceItems={kafkaInstanceItems}
            mainToggle={mainToggle}
            onConnectToInstance={onConnectToInstance}
            refresh={fetchKafkas}
            createStreamsInstance={createStreamsInstance}
            setCreateStreamsInstance={setCreateStreamsInstance}
            page={page}
            perPage={perPage}
            total={kafkaInstancesList?.total}
          />
        ) : (
          kafkaDataLoaded && (
            <EmptyState
              createStreamsInstance={createStreamsInstance}
              setCreateStreamsInstance={setCreateStreamsInstance}
              mainToggle={mainToggle}
            />
          )
        )}
        {createStreamsInstance && (
          <CreateInstanceModal
            createStreamsInstance={createStreamsInstance}
            setCreateStreamsInstance={setCreateStreamsInstance}
            mainToggle={mainToggle}
            refresh={fetchKafkas}
          />
        )}
      </PageSection>
    </>
  );
};

export { OpenshiftStreams };
