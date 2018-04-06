import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { SubmissionError, change } from 'redux-form';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import { performLogin, setLogoutMessage } from '../../actions/authAction';
import LoginForm, { FORM_NAME } from './LoginForm';
import { Dialog, OtpForm, IconTitle, Notification } from '../../components';
import { NOTIFICATIONS } from '../../actions/appActions';
import { errorHandler } from '../../components/OtpForm/utils';
import {
	HOLLAEX_LOGO,
	FLEX_CENTER_CLASSES,
	ICONS
} from '../../config/constants';

import STRINGS from '../../config/localizedStrings';

class Login extends Component {
	state = {
		values: {},
		otpDialogIsOpen: false,
		logoutDialogIsOpen: false
	};

	componentDidMount() {
		if (this.props.logoutMessage) {
			this.setState({ logoutDialogIsOpen: true });
		}
	}
	componentWillReceiveProps(nextProps) {
		if (
			nextProps.logoutMessage &&
			nextProps.logoutMessage !== this.props.logoutMessage
		) {
			this.setState({ logoutDialogIsOpen: true });
		}
	}

	componentWillUnmount() {
		this.props.setLogoutMessage();
	}

	redirectToHome = () => {
		this.props.router.replace('/account');
	};

	redirectToResetPassword = () => {
		this.props.router.replace('/reset-password');
	};

	onSubmitLogin = (values) => {
		return performLogin(values)
			.then((res) => {
				this.redirectToHome();
			})
			.catch((err) => {
				const _error = err.response.data
					? err.response.data.message
					: err.message;

				let error = {};
				this.props.change(FORM_NAME, 'captcha', '');

				if (_error.toLowerCase().indexOf('otp') > -1) {
					this.setState({ values, otpDialogIsOpen: true });
					error._error = STRINGS.VALIDATIONS.OTP_LOGIN;
				} else {
					if (_error === 'User is not activated') {
						error._error = (
							<div style={{ color: 'black'}}>
								Account approval is required to access the demo exchange.<br />
								Please contact us at <a style={{ color: 'blue' }} href="mailto:support@bitholla.com?Subject=Approval%20request" target="_top">support@bitholla.com</a> with your use case for approval access
							</div>
						)
					} else {
						error._error = _error;
					}
					throw new SubmissionError(error);
				}
			});
	};

	onSubmitLoginOtp = (values) => {
		return performLogin(
			Object.assign({ otp_code: values.otp_code }, this.state.values)
		)
			.then((res) => {
				this.setState({ otpDialogIsOpen: false });
				this.redirectToHome();
			})
			.catch(errorHandler);
	};

	onCloseDialog = () => {
		this.setState({ otpDialogIsOpen: false });
	};

	onCloseLogoutDialog = () => {
		this.props.setLogoutMessage();
		this.setState({ logoutDialogIsOpen: false });
	};

	render() {
		const { logoutMessage } = this.props;
		const { otpDialogIsOpen, logoutDialogIsOpen } = this.state;

		return (
			<div className={classnames(...FLEX_CENTER_CLASSES, 'flex-column', 'f-1')}>
				<div
					className={classnames(
						...FLEX_CENTER_CLASSES,
						'flex-column',
						'auth_wrapper',
						'w-100'
					)}
				>
					<IconTitle
						iconPath={HOLLAEX_LOGO}
						text={STRINGS.LOGIN_TEXT}
						textType="title"
						underline={true}
						useSvg={true}
						className="w-100 exir-logo"
						subtitle={STRINGS.formatString(
							STRINGS.LOGIN.LOGIN_TO,
							STRINGS.APP_TITLE
						)}
						actionProps={{
							text: STRINGS.LOGIN.CANT_LOGIN,
							iconPath: ICONS.BLUE_ARROW_RIGHT,
							onClick: this.redirectToResetPassword
						}}
					/>
					<div
						className={classnames(
							...FLEX_CENTER_CLASSES,
							'flex-column',
							'auth_form-wrapper',
							'w-100'
						)}
					>
						<LoginForm onSubmit={this.onSubmitLogin} />
					</div>
				</div>
				<div className={classnames('f-1', 'link_wrapper')}>
					{STRINGS.LOGIN.NO_ACCOUNT}
					<Link to="/signup" className={classnames('blue-link')}>
						{STRINGS.LOGIN.CREATE_ACCOUNT}
					</Link>
				</div>
				<Dialog
					isOpen={otpDialogIsOpen || logoutDialogIsOpen}
					label="otp-modal"
					onCloseDialog={this.onCloseDialog}
					shouldCloseOnOverlayClick={otpDialogIsOpen ? false : true}
					showCloseText={otpDialogIsOpen ? true : false}
				>
					{otpDialogIsOpen && <OtpForm onSubmit={this.onSubmitLoginOtp} />}
					{logoutDialogIsOpen && (
						<Notification
							type={NOTIFICATIONS.LOGOUT}
							onClose={this.onCloseLogoutDialog}
							data={{ message: logoutMessage }}
						/>
					)}
				</Dialog>
			</div>
		);
	}
}

const mapStateToProps = (store) => ({
	logoutMessage: store.auth.logoutMessage
});

const mapDispatchToProps = (dispatch) => ({
	setLogoutMessage: bindActionCreators(setLogoutMessage, dispatch),
	change: bindActionCreators(change, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);