import { configure } from '@testing-library/react';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter(),testIdAttribute:'id' });
