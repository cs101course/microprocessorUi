import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from './App';
import { getHeadings, getProcessors } from '@cs101/microprocessorexamples';

const urlSearchParams = new URLSearchParams(window.location.search);
const devicesParam = urlSearchParams.get('devices');
const devices = devicesParam ? devicesParam.split(',') : null;


const switchesParam = urlSearchParams.get("switches");
const switches = switchesParam ? switchesParam.split(',').map((switchConfig) => {
  const [col, row, isOn] = switchConfig.split('x');
  return {
    col: Number(col),
    row: Number(row),
    state: isOn === '1'
  }
}) : undefined;

const panParam = urlSearchParams.get("pan");
const pan = panParam ? panParam.split('x').map(Number) : undefined;

const processors = getProcessors(devices);
const headings = getHeadings(devices);

ReactDOM.render(<App processors={processors} instructionHeadings={headings} environment={{ switches }} pan={pan ? { x: pan[0], y: pan[1] } : undefined}/>, document.getElementById('root'));
