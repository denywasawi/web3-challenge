import { ChainData, Token } from '@0xsquid/sdk/dist/types';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface SquidState {
  tokens: Token[];
  chains: ChainData[];
}

const initialState: SquidState = {
  tokens: [],
  chains: []
};

export const squidSlice = createSlice({
  name: 'squid',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<Token[]>) => {
      state.tokens = action.payload;
    },
    setChains: (state, action: PayloadAction<ChainData[]>) => {
      state.chains = action.payload;
    },
  },
});

export const { setTokens, setChains } = squidSlice.actions;

export default squidSlice.reducer;