import PropTypes from 'prop-types';

import {APIRequestMethod, Client} from 'app/api';
import {
  addLoadingMessage,
  clearIndicators,
  addErrorMessage,
} from 'app/actionCreators/indicator';
import {t} from 'app/locale';
import Form from 'app/components/forms/form';
import FormState from 'app/components/forms/state';

type Props = Form['props'] & {
  onSubmit?: (data: object) => void;
  apiEndpoint: string;
  apiMethod: APIRequestMethod;
  submitLoadingMessage?: string;
  submitErrorMessage?: string;
};

export default class ApiForm extends Form<Props> {
  api = new Client();

  static propTypes = {
    ...Form.propTypes,
    groupDataByDisabled: PropTypes.func,
    onSubmit: PropTypes.func,
    apiMethod: PropTypes.string.isRequired,
    apiEndpoint: PropTypes.string.isRequired,
    submitLoadingMessage: PropTypes.string,
    submitErrorMessage: PropTypes.string,
  };

  static defaultProps = {
    ...Form.defaultProps,
    submitErrorMessage: t('There was an error saving your changes.'),
    submitLoadingMessage: t('Saving changes\u2026'),
  };

  componentWillUnmount() {
    this.api.clear();
  }

  groupDataByDisabled() {
    // Return two hashes, one with data for live elements and another for disabled.
    const [{data}, disabledData] = [{...this.state}, {}];
    this.props.children &&
      this.props.children.forEach(child => {
        // Bit of a hack: loop over components named *Field to find disabled ones.
        if (child.type && child.type.name && RegExp('Field$').test(child.type.name)) {
          if (child.props.disabled) {
            disabledData[child.key] = data[child.key];
            delete data[child.key];
          }
        }
      });
    return [data, disabledData];
  }

  onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (this.state.state === FormState.SAVING) {
      return;
    }

    const [data, disabledData] = this.groupDataByDisabled();

    this.props.onSubmit && this.props.onSubmit(data);
    this.setState(
      {
        state: FormState.SAVING,
        data: {...this.state.data, ...disabledData},
      },
      () => {
        addLoadingMessage(this.props.submitLoadingMessage);
        this.api.request(this.props.apiEndpoint, {
          method: this.props.apiMethod,
          data,
          success: result => {
            clearIndicators();
            this.onSubmitSuccess({...disabledData, ...(result || {})});
          },
          error: error => {
            addErrorMessage(this.props.submitErrorMessage);
            this.onSubmitError(error);
          },
        });
      }
    );
  };
}
