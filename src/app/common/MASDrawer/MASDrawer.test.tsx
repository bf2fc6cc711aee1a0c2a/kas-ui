import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tab, Tabs, TabTitleText } from "@patternfly/react-core";
import { MASDrawer, MASDrawerProps } from "./MASDrawer";

describe("<MASDrawer/>", () => {
  const renderSetup = (props: MASDrawerProps) => {
    const children = <div>Drawer content</div>;
    return render(<MASDrawer {...props}>{children}</MASDrawer>);
  };

  it("should render default MASDrawer", () => {
    //arrange
    const onClose = jest.fn();
    const props: MASDrawerProps = {
      onClose,
      isLoading: true,
      children: undefined,
    };

    const { container } = renderSetup(props);

    //assert
    screen.getByText("Drawer content");
    expect(container.getElementsByClassName("pf-c-drawer").length).toBe(1);
  });

  it("should render MASDrawer with props and load Drawer content body", () => {
    //arrange
    const onClose = jest.fn();
    const activeKey = 0;
    const handleTabClick = jest.fn();
    const panelBodyContent = () => (
      <Tabs activeKey={activeKey} onSelect={handleTabClick}>
        <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>}>
          <div>Details tab content</div>
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>Connection</TabTitleText>}>
          <div>Connection tab content</div>
        </Tab>
      </Tabs>
    );
    const props: MASDrawerProps = {
      onClose,
      isLoading: false,
      isExpanded: true,
      panelBodyContent: panelBodyContent(),
      drawerHeaderProps: {
        text: { label: "test-instance" },
        title: { value: "name", headingLevel: "h1" },
      },
      children: undefined,
    };

    const { container } = renderSetup(props);

    //act
    act(() => {
      const detailsTab = screen.getByRole("tab", { name: /Details/i });
      userEvent.click(detailsTab);
      const connectionTab = screen.getByRole("tab", {
        name: /Connection/i,
      });
      userEvent.click(connectionTab);
      const closeButton = screen.getByRole("button", {
        name: /Close drawer panel/i,
      });
      userEvent.click(closeButton);
    });

    //assert
    expect(handleTabClick).toHaveBeenCalled();
    screen.getByText("test-instance");
    screen.getByText("Details");
    screen.getByText("Details tab content");
    screen.getByText("Connection");
    screen.getByText("Connection tab content");
    expect(container.getElementsByClassName("pf-m-expanded").length).toBe(1);
    expect(onClose).toHaveBeenCalled();
  });
});
