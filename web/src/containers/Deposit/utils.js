import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { STATIC_ICONS } from 'config/icons';
import STRINGS from 'config/localizedStrings';
import { EditWrapper, Button, SmartTarget } from 'components';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { required } from 'components/Form/validations';
import { getNetworkNameByKey } from 'utils/wallet';

import Image from 'components/Image';
import renderFields from 'components/Form/factoryFields';
import { isMobile } from 'react-device-detect';
import Fiat from './Fiat';

export const generateBaseInformation = (id = '') => (
	<div className="text">
		{id && (
			<p>
				{STRINGS.formatString(STRINGS['DEPOSIT_BANK_REFERENCE'], id).join(' ')}
			</p>
		)}
	</div>
);

export const generateFormFields = ({
	currency,
	networks,
	address,
	label,
	onCopy,
	copyOnClick,
	destinationAddress,
	destinationLabel,
	coins,
	network,
	fee,
	openQRCode,
}) => {
	const fields = {};

	if (networks) {
		const networkOptions = networks.map((network) => ({
			value: network,
			label: getNetworkNameByKey(network),
		}));

		const { min } = coins[currency];
		const warnings = [STRINGS['DEPOSIT_FORM_NETWORK_WARNING']];
		if (min) {
			warnings.push(
				STRINGS.formatString(
					STRINGS['DEPOSIT_FORM_MIN_WARNING'],
					min,
					currency.toUpperCase()
				)
			);
		}

		fields.network = {
			type: 'select',
			stringId:
				'WITHDRAWALS_FORM_NETWORK_LABEL,WITHDRAWALS_FORM_NETWORK_PLACEHOLDER,DEPOSIT_FORM_NETWORK_WARNING,DEPOSIT_FORM_MIN_WARNING',
			label: STRINGS['WITHDRAWALS_FORM_NETWORK_LABEL'],
			placeholder: STRINGS['WITHDRAWALS_FORM_NETWORK_PLACEHOLDER'],
			warnings,
			validate: [required],
			fullWidth: true,
			options: networkOptions,
			hideCheck: true,
			ishorizontalfield: true,
			disabled: networks.length === 1,
		};
	}

	if (address) {
		fields.address = {
			type: 'dumb',
			label,
			fullWidth: true,
			allowCopy: true,
			onCopy,
			copyOnClick,
			hideCheck: true,
			ishorizontalfield: true,
			notification: [
				{
					stringId: 'QR_CODE.SHOW',
					text: STRINGS['QR_CODE.SHOW'],
					status: 'information',
					iconPath: STATIC_ICONS['QR_CODE_SHOW'],
					className: 'file_upload_icon',
					useSvg: true,
					onClick: openQRCode,
					hideActionText: true,
				},
			],
		};
	}

	if (destinationAddress) {
		fields.destinationAddress = {
			type: 'dumb',
			label: destinationLabel,
			fullWidth: true,
			allowCopy: true,
			onCopy,
			copyOnClick,
			hideCheck: true,
			ishorizontalfield: true,
		};
	}

	if (fee) {
		const feeKey = networks ? network : currency;
		const { deposit_fees } = coins[currency];
		if (deposit_fees && deposit_fees[feeKey]) {
			const { symbol, type } = deposit_fees[feeKey];
			const isPercentage = type === 'percentage';
			const fee_coin = isPercentage ? '' : symbol || currency;

			const fullname = coins[fee_coin]?.fullname || '';

			fields.fee = {
				type: 'number',
				stringId:
					'WITHDRAWALS_FORM_FEE_COMMON_LABEL,WITHDRAWALS_FORM_FEE_PLACEHOLDER',
				label: STRINGS.formatString(
					STRINGS[
						fee_coin && fee_coin !== currency
							? 'WITHDRAWALS_FORM_FEE_COMMON_LABEL_COIN'
							: 'WITHDRAWALS_FORM_FEE_COMMON_LABEL'
					],
					fullname
				),
				placeholder: STRINGS.formatString(
					STRINGS['WITHDRAWALS_FORM_FEE_PLACEHOLDER'],
					fullname
				),
				disabled: true,
				fullWidth: true,
				ishorizontalfield: true,
				...(fee_coin && fee_coin !== currency
					? {
							warning: STRINGS.formatString(
								STRINGS['WITHDRAWALS_FORM_FEE_WARNING'],
								fullname,
								fee_coin.toUpperCase()
							),
					  }
					: {}),
			};
		}
	}

	return fields;
};

const RenderContentForm = ({
	titleSection,
	currency,
	coins = {},
	onCopy,
	onOpen,
	setCopied,
	copied,
	address,
	showGenerateButton,
	formFields,
	icons: ICONS,
	selectedNetwork,
	targets,
}) => {
	const coinObject = coins[currency];

	const generalId = 'REMOTE_COMPONENT__FIAT_WALLET_DEPOSIT';
	const currencySpecificId = `${generalId}__${currency.toUpperCase()}`;
	const id = targets.includes(currencySpecificId)
		? currencySpecificId
		: generalId;

	if (coinObject && coinObject.type !== 'fiat') {
		return (
			<SmartTarget
				id={currencySpecificId}
				titleSection={titleSection}
				currency={currency}
			>
				<div className="withdraw-form-wrapper">
					<div className="withdraw-form">
						<div className="d-flex align-items-center">
							<Image
								iconId={'DEPOSIT_BITCOIN'}
								icon={ICONS['DEPOSIT_BITCOIN']}
								wrapperClassName="form_currency-ball margin-aligner"
							/>
							{titleSection}
						</div>
						{(currency === 'xrp' ||
							currency === 'xlm' ||
							selectedNetwork === 'xlm' ||
							selectedNetwork === 'ton') && (
							<div className="d-flex">
								<div className="d-flex align-items-baseline field_warning_wrapper">
									<ExclamationCircleFilled className="field_warning_icon" />
									<div className="field_warning_text">
										<EditWrapper stringId="DEPOSIT_FORM_TITLE_WARNING_DESTINATION_TAG">
											{STRINGS['DEPOSIT_FORM_TITLE_WARNING_DESTINATION_TAG']}
										</EditWrapper>
									</div>
								</div>
							</div>
						)}
						{renderFields(formFields)}
					</div>
					{showGenerateButton && (
						<div className="btn-wrapper">
							<Button
								stringId="GENERATE_WALLET"
								label={STRINGS['GENERATE_WALLET']}
								onClick={onOpen}
							/>
						</div>
					)}
					{isMobile && address && (
						<div className="btn-wrapper">
							<CopyToClipboard text={address} onCopy={setCopied}>
								<Button
									onClick={onCopy}
									label={
										copied ? STRINGS['SUCCESFUL_COPY'] : STRINGS['COPY_ADDRESS']
									}
								/>
							</CopyToClipboard>
						</div>
					)}
				</div>
			</SmartTarget>
		);
	} else if (coinObject && coinObject.type === 'fiat') {
		return <Fiat id={id} titleSection={titleSection} currency={currency} />;
	} else {
		return <div>{STRINGS['DEPOSIT.NO_DATA']}</div>;
	}
};

const mapStateToProps = ({ app: { targets } }) => ({
	targets,
});

const Form = reduxForm({
	form: 'GenerateWalletForm',
	enableReinitialize: true,
})(RenderContentForm);

export default connect(mapStateToProps)(Form);
