import {
  Button,
  ButtonVariant,
  EmptyStateVariant,
} from "@patternfly/react-core";
import MinusCircleIcon from "@patternfly/react-icons/dist/js/icons/minus-circle-icon";
import { MASEmptyState, MASEmptyStateProps } from "./MASEmptyState";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("<MASEmptyState/>", () => {
  const renderSetup = (props = {}) => {
    return render(<MASEmptyState {...props} />);
  };

  it("should render dafault MASEmptyState", () => {
    //arrange
    const { container } = renderSetup();

    //assert
    expect(
      container.getElementsByClassName("pf-c-empty-state pf-u-pt-2xl").length
    ).toBe(1);
    expect(
      container.getElementsByClassName("pf-c-empty-state__icon").length
    ).toBe(1);
    //title
    expect(container.getElementsByClassName("pf-c-title").length).toBe(0);
    //empty state body
    expect(
      container.getElementsByClassName("pf-c-empty-state__body").length
    ).toBe(0);
    //button
    expect(container.getElementsByClassName("pf-c-button").length).toBe(0);
  });

  it("should render MASEmptyState with props", () => {
    //arrange
    const onClick = jest.fn();
    const props: MASEmptyStateProps = {
      titleProps: { title: "empty state", headingLevel: "h1", size: "2xl" },
      emptyStateProps: {
        className: "empty-state-class",
        variant: EmptyStateVariant.large,
        isFullHeight: true,
      },
      emptyStateIconProps: {
        className: "icon-class",
        icon: MinusCircleIcon,
        variant: "icon",
      },
      emptyStateBodyProps: {
        className: "empty-body-class",
        body: "This is empty state body",
      },
      buttonProps: {
        title: "create instance",
        variant: ButtonVariant.primary,
        onClick,
      },
    };

    const { container } = renderSetup(props);

    //act
    act(() => {
      const button = screen.getByRole("button", { name: /create instance/i });
      userEvent.click(button);
    });

    //assert
    expect(container.getElementsByClassName("empty-state-class").length).toBe(
      1
    );
    expect(container.getElementsByClassName("icon-class").length).toBe(1);
    expect(container.getElementsByClassName("empty-body-class").length).toBe(1);
    //check height css
    expect(container.getElementsByClassName("pf-m-full-height").length).toBe(1);
    screen.getAllByText(/empty state/);
    screen.getAllByText(/This is empty state body/);
    screen.getAllByText(/create instance/);
    expect(onClick).toHaveBeenCalled();
  });

  it("should render MASEmptyState with children", () => {
    //arrange
    const onClick = jest.fn();
    render(
      <MASEmptyState>
        <Button
          type="button"
          variant={ButtonVariant.secondary}
          onClick={onClick}
        >
          Home Page
        </Button>
      </MASEmptyState>
    );

    //act
    act(() => {
      const button = screen.getByRole("button", { name: /Home Page/i });
      userEvent.click(button);
    });

    //assert
    screen.getAllByText(/Home Page/);
    expect(onClick).toHaveBeenCalled();
  });
});
