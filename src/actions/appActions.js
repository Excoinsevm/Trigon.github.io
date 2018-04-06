import { setLanguage as storeLanguageInBrowser } from '../utils/string';
import axios from 'axios';

export const SET_NOTIFICATION = 'SET_NOTIFICATION';
export const CLOSE_NOTIFICATION = 'CLOSE_NOTIFICATION';
export const CLOSE_ALL_NOTIFICATION = 'CLOSE_ALL_NOTIFICATION';
export const NOTIFICATIONS = {
	ORDERS: 'NOTIFICATIONS_ORDERS',
	TRADES: 'NOTIFICATIONS_TRADES',
	DEPOSIT: 'NOTIFICATIONS_DEPOSIT',
	WITHDRAWAL: 'NOTIFICATIONS_WITHDRAWAL',
	ERROR: 'NOTIFICATIONS_ERROR',
	LOGOUT: 'NOTIFICATIONS_LOGOUT',
	VERIFICATION: 'NOTIFICATIONS_VERIFICATION',
	CONTACT_FORM: 'NOTIFICATIONS_CONTACT_FORM',
	NEW_ORDER: 'NOTIFICATIONS_NEW_ORDER'
};
export const CONTACT_FORM = 'CONTACT_FORM';
export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE';

export const setNotification = (type = '', data = {}, show = true) => ({
	type: SET_NOTIFICATION,
	payload: {
		type,
		data,
		show,
		timestamp: Date.now()
	}
});

export const closeNotification = () => ({
	type: CLOSE_NOTIFICATION,
	payload: {}
});

export const closeAllNotification = () => ({
	type: CLOSE_ALL_NOTIFICATION,
	payload: {}
});

export const openContactForm = (data = {}) =>
	setNotification(CONTACT_FORM, 'Contact Form', data);

export const setLanguage = (value = 'en') => {
	const language = storeLanguageInBrowser(value);
	return {
		type: CHANGE_LANGUAGE,
		payload: {
			language
		}
	};
};

export const sendSupportMail = (values = {}) => {
	return axios.post('/support', values);
};