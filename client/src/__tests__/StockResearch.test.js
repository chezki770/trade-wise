import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import StockResearch from '../components/stock-research/StockResearch';

const mockStore = configureMockStore([thunk]);

describe('StockResearch Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { id: '123', name: 'Test User' }
      },
      errors: {}
    });
  });

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <StockResearch />
      </Provider>
    );
    expect(screen.getByText(/Stock Research/i)).toBeInTheDocument();
  });

  it('handles stock symbol search', async () => {
    render(
      <Provider store={store}>
        <StockResearch />
      </Provider>
    );

    const input = screen.getByPlaceholderText(/Enter stock symbol/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'AAPL' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(store.getActions()).toContainEqual(
        expect.objectContaining({
          type: expect.stringContaining('GET_STOCK_')
        })
      );
    });
  });

  it('displays error message for invalid symbol', async () => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { id: '123', name: 'Test User' }
      },
      errors: { stockError: 'Invalid stock symbol' }
    });

    render(
      <Provider store={store}>
        <StockResearch />
      </Provider>
    );

    const input = screen.getByPlaceholderText(/Enter stock symbol/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'INVALID' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid stock symbol/i)).toBeInTheDocument();
    });
  });

  it('displays stock price history chart when data is available', async () => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { id: '123', name: 'Test User' }
      },
      errors: {},
      stocks: {
        history: [
          { date: '2024-01-01', price: 100 },
          { date: '2024-01-02', price: 102 }
        ]
      }
    });

    render(
      <Provider store={store}>
        <StockResearch />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('price-history-chart')).toBeInTheDocument();
    });
  });
});
