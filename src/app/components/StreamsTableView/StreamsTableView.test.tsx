import React from 'react';
import { StreamsTableView, TableProps } from './StreamsTableView';
import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import OpenAPIBackend from 'openapi-backend';
import * as path from 'path';

//create our mock backend with openapi-backend
const api = new OpenAPIBackend({ definition: path.join(__dirname, '../../../../mas-mock/managed-services-api.yaml') });
api.register('notFound', (c, res, ctx) => res(ctx.status(404)));
api.register('notImplemented', (c, res, ctx) => {
  const { status, mock } = api.mockResponseForOperation(c.operation.operationId || '');
  return res(ctx.status(status), ctx.json(mock));
});

// tell msw to intercept all requests to api/* with our mock
const server = setupServer(rest.get('/api/*', (req, res, ctx) => api.handleRequest(req as any, res, ctx)));

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('<StreamsTableView/>', () => {
  const porps: TableProps = {
    createStreamsInstance: false,
    setCreateStreamsInstance: jest.fn(),
    kafkaInstanceItems: [],
    onViewInstance: jest.fn(),
    onViewConnection: jest.fn(),
    onConnectToInstance: jest.fn(),
    mainToggle: false,
    refresh: jest.fn(),
    page: 1,
    perPage: 10,
    total: 10,
    kafkaDataLoaded: false,
    expectedTotal: 0,
  };

  it('should render', () => {
    render(<StreamsTableView {...porps} />);
  });
  screen.debug();
});
