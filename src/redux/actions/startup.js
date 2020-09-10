
export const STARTUP_SEND_REQUEST = 'STARTUP_SEND_REQUEST';
export const STARTUP_ERROR = 'STARTUP_ERROR';

import { ApiProvider } from '../../services/ApiProvider';
import { BACKEND_BASE_URL } from '../../../config/constants';

export const defaultState = {
};

export function requestSend(params, iType) {
    return async (dispatch, getState) => {
        try {
            var request = await ApiProvider(BACKEND_BASE_URL + 'customer/request', 'POST', params);
            dispatch({
                type: STARTUP_SEND_REQUEST,
                payload: request.payload,
                iType: iType
            });
        } catch (error) {
            dispatch({
                type: STARTUP_ERROR,
                payload: error
            });
        };
    };
}