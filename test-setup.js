import { configure } from '@testing-library/react';
import Adapter from 'enzyme-adapter-react-16';
import "@testing-library/jest-dom/extend-expect";

configure({ adapter: new Adapter() });