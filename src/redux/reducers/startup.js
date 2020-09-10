import {
  STARTUP_SEND_REQUEST,
  STARTUP_ERROR,
  defaultState
} from '../actions/startup';
import handleToastify from '../../components/toast';
const startup = (state = defaultState, { type, payload, iType = 0 }) => {
  switch (type) {
    case STARTUP_SEND_REQUEST:
      handleToastify(
        "bg-success",
        iType == 0 ? 'Thanks for requesting a demo, we have emailed you for your records.'
            : 'Thanks for reaching out. We will get back as soon as possible.'
      );
      return {
        ...state,
      };
    case STARTUP_ERROR:
      handleToastify(
        "bg-danger",
        payload
      );
      return { ...state};
    default:
      return state
  }
};

export default startup;