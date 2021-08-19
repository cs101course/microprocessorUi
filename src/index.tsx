import * as React from "react";
import * as ReactDOM from 'react-dom';


import { processor as robo4I } from "./processors/robo4I";
import { processor as robo4II } from "./processors/robo4II";
import { processor as robo4III } from "./processors/robo4III";
import { processor as robo4IV } from "./processors/robo4IV";

import { processor as proc4I } from "./processors/proc4I";
import { processor as proc4II } from "./processors/proc4II";
import { processor as proc4III } from "./processors/proc4III";
import { processor as proc4IV } from "./processors/proc4IV";
import { processor as proc4V } from "./processors/proc4V";

import { processor as proc8VI } from "./processors/proc8VI";
import { processor as proc8VII } from "./processors/proc8VII";
import { processor as proc8VIII } from "./processors/proc8VIII";
import { processor as proc8IX } from "./processors/proc8IX";
import { processor as proc8X } from "./processors/proc8X";

import { App } from './App';
import { Processor } from "@cs101/microprocessor/dist/types";
import { SupportedPeripherals } from "./types";

const robots4Bit: Array<Processor<SupportedPeripherals>> = [
  robo4I,
  robo4II,
  robo4III,
  robo4IV
];

const processors4Bit: Array<Processor<SupportedPeripherals>> = [
  proc4I,
  proc4II,
  proc4III,
  proc4IV,
  proc4V
];

const processors8Bit: Array<Processor<SupportedPeripherals>> = [
  proc8VI,
  proc8VII,
  proc8VIII,
  proc8IX,
  proc8X
];

const allProcessors = robots4Bit.concat(processors4Bit).concat(processors8Bit);

const processors = [robo4I, robo4II];//, robo4III];

ReactDOM.render(<App processors={allProcessors} />, document.getElementById('root'));
