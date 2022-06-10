import { FunctionComponent } from "react";
import {
  InstanceDrawer,
  InstanceDrawerProps,
} from "@app/modules/InstanceDrawer/InstanceDrawer";
import { ModalProvider } from "@rhoas/app-services-ui-components";
import { KasModalLoader } from "@app/modals";

export type InstanceDrawerFederatedProps = InstanceDrawerProps;

const InstanceDrawerFederated: FunctionComponent<
  InstanceDrawerFederatedProps
> = ({ children, ...props }) => {
  return (
    <ModalProvider>
      <InstanceDrawer {...props}>{children}</InstanceDrawer>
      <KasModalLoader />
    </ModalProvider>
  );
};

export default InstanceDrawerFederated;
