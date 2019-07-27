import React from 'react';
import { shallow } from 'enzyme';
import { Resource } from './Resource';
import { foodResource, blankResource } from '../DataMocks';
import useResource from './useResource';

jest.mock('../utils/searchParams');
jest.mock('../constants');
jest.mock('./LoadingSpinner.tsx', () => 'LoadingSpinner');
jest.mock('./useResource.tsx');
const mockedUseResource = useResource as jest.Mock;
jest.mock('../App.styles', () => ({
  Container: 'Container'
}));
jest.mock('./Details', () => ({
  __esModule: true,
  default: 'Details',
  DetailBody: 'DetailBody',
  DetailHeading: 'DetailHeading'
}));
jest.mock('./Schedule', () => 'Schedule');

describe('<Resource/>', () => {
  mockedUseResource.mockImplementation(() => foodResource) as typeof jest.mock;
  const wrapper = shallow(<Resource />);

  it('renders the charityname property of the resource prop object', () => {
    expect(wrapper.find('h1').text()).toBe(foodResource.charityname);
  });

  it('renders a loading spinner when a resource is not loaded', () => {
    mockedUseResource.mockImplementation(() => null) as typeof jest.mock;
    const wrapper = shallow(<Resource />);

    expect(wrapper.find('LoadingSpinner').length).toBe(1);
  });
});
