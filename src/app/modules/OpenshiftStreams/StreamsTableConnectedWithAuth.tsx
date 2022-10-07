import { useEffect, useState, VoidFunctionComponent } from "react";
import {
  StreamsTableConnected,
  StreamsTableProps,
} from "@app/modules/OpenshiftStreams/components/StreamsTableConnected";
import { useAuth } from "@rhoas/app-services-ui-shared";

export const StreamsTableConnectedWithAuth: VoidFunctionComponent<
  Pick<StreamsTableProps, "preCreateInstance">
> = ({ preCreateInstance }) => {
  const { getUsername, isOrgAdmin } = useAuth();
  const [user, setUser] = useState<
    Pick<StreamsTableProps, "currentUser" | "isCurrentUserOrgAdmin"> | undefined
  >(undefined);

  useEffect(() => {
    async function getUser() {
      const username = await getUsername();
      const orgAdmin = await isOrgAdmin();

      if (username !== undefined && orgAdmin !== undefined) {
        setUser({
          currentUser: username,
          isCurrentUserOrgAdmin: orgAdmin,
        });
      }
    }

    void getUser();
  }, [getUsername, isOrgAdmin]);

  return (
    <StreamsTableConnected
      preCreateInstance={preCreateInstance}
      currentUser={user?.currentUser}
      isCurrentUserOrgAdmin={user?.isCurrentUserOrgAdmin || false}
    />
  );
};
