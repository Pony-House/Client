import { Dispatcher } from 'flux';

const appDispatcher = new Dispatcher();
export default {
  dispatch: (data) => appDispatcher.dispatch(data),
  register: (data) => appDispatcher.register(data),
};
