import { createSlice } from '@reduxjs/toolkit';

export const appSlice = createSlice({
  name: 'app',
  initialState: {
    authorized: false,
    links: [],
  },
  reducers: {
    authorize: (state) => {
      state.authorized = true;
    },
    deauthorize: (state) => {
      state.authorized = false;
    },
    hydrateLinks: (state, links) => {
      state.links = links.payload;
    },
    drainLinks: (state) => {
      state.links.length = 0;
    },
    addLink: (state, link) => {
      state.links.push(link.payload);
    },
    removeLink: (state, ind) => {
      state.links.splice(ind, 1);
    },
    updateLink: (state, link, ind) => {
      state.links[ind] = link.payload;
    },
  },
});

export const {
  authorize,
  deauthorize,
  hydrateLinks,
  drainLinks,
  addLink,
  removeLink,
  updateLink,
} = appSlice.actions;

export const selectAuthorized = (state) => state.authorized;

export const selectLinks = (state) => state.links;

export default appSlice.reducer;
