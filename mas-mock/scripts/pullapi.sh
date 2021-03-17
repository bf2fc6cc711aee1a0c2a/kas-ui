
echo "Synchronizing managed-services-api"

wget --no-check-certificate https://gitlab.cee.redhat.com/service/managed-services-api/-/raw/master/openapi/kas-fleet-manager.yaml
mv kas-fleet-manager.yaml ./kas-fleet-manager.yaml

## Copy api to mock
cp ./openapi/kas-fleet-manager.yaml ./mas-mock/kas-fleet-manager.yaml

echo "Finished synchronization with managed-services-api"
