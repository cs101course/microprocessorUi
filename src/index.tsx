import * as React from "react";
import * as ReactDOM from 'react-dom';

import { processor } from "@cs101/microprocessor/dist/processors/proc8102";
import { App } from './App';

ReactDOM.render(<App processor={processor} />, document.getElementById('root'));
