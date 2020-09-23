import '../css/index.css'

import ko from 'knockout'
import { App } from './classes/app'

window.ko = ko
window.$ = require('jquery')

window.app = new App('Tape', '0.1.0')
window.app.run()