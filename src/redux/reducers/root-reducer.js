import { combineReducers } from 'redux';
import { entities } from 'redux-entity';
import startup from './startup';

export default combineReducers({
  entities,
  startup,
});
