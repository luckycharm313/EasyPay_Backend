import {
  STARTUP_SEND_REQUEST,
  STARTUP_ERROR,
  defaultState
} from '../actions/startup';

const startup = (state = defaultState, { type, payload }) => {
  switch (type) {
    case STARTUP_SEND_REQUEST:
      alert('Sent successfully!');
      return {
        ...state,
      };
    case STARTUP_ERROR:
      alert(payload);
      return { ...state};
    default:
      return state
  }
};

export default startup;