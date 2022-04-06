import { Component, ErrorInfo, ReactNode } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { withTranslation, WithTranslation } from "react-i18next";
import { PageSection, Button } from "@patternfly/react-core";
import { MASEmptyState, MASEmptyStateVariant } from "@app/common";
import "./MASErrorBoundary.css";

type Props = WithTranslation &
  RouteComponentProps & {
    children?: ReactNode;
  };

type State = {
  hasError?: boolean;
};

class MASErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("error:", error, errorInfo);
  }

  onClickButton = () => {
    const { history } = this.props;
    this.setState({ hasError: false });
    history && history.push("/");
  };

  render() {
    const { t } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      return (
        <PageSection padding={{ default: "noPadding" }} isFilled>
          <MASEmptyState
            emptyStateProps={{
              variant: MASEmptyStateVariant.UnexpectedError,
            }}
            emptyStateIconProps={{
              className: "icon-color",
            }}
            titleProps={{
              title: t("common.something_went_wrong"),
            }}
            emptyStateBodyProps={{
              body: t("unexpected_error"),
            }}
          >
            <Button onClick={this.onClickButton}>
              {t("go_to_kafka_instances")}
            </Button>
          </MASEmptyState>
        </PageSection>
      );
    }
    return this.props.children;
  }
}

const MASErrorBoundaryComponent = withRouter(
  withTranslation()(MASErrorBoundary)
);
export { MASErrorBoundaryComponent as MASErrorBoundary };
