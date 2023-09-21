import { Dispatcher } from 'flux';

const appDispatcher = new Dispatcher();
export default {
    dispatch: (data) => setTimeout(() => appDispatcher.dispatch(data), 1),
    register: (data) => appDispatcher.register(data),
};
