import { configureStore } from '@reduxjs/toolkit';
import reducer from './reducers/appSlice';

export default configureStore({
  reducer: reducer,
});
