[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)

# Application Services - Kafka Administration UI

Kafka Adminstration UI contains federated module for creating Kafka instances as part of the console.redhat.com

UI is used as federated module in [app-services ui](https://github.com/redhat-developer/app-services-ui) project
that aggretates various service components.

> NOTE: This repository is used as part of the console.redhat.com and it uses Kafka Fleet Management API:
> https://api.openshift.com/?urls.primaryName=kafka%20service%20fleet%20manager%20service

## Quick-start

```bash
sudo echo "127.0.0.1 prod.foo.redhat.com" >> /etc/hosts
git clone https://github.com/bf2fc6cc711aee1a0c2a/kas-ui.git
cd kas-ui
npm install
BASE_PATH=https://api.openshift.com npm run start:dev
```

The dev server runs using self-signed certificates, so you'll need to accept / install them into your system in order to load the UI. In Chrome you can simply accept the warnings and it will allow you in.

## Contributing

The lead developer is [Ajay Pratap](https://github.com/ajaypratap003) and the lead designer is [Jenn Giardino](https://github.com/jgiardino), please feel free to contact us!

If you are contributing please check out the [Contributing Guidelines.](https://github.com/bf2fc6cc711aee1a0c2a/kas-ui/blob/master/CONTRIBUTING.md)
