import React from 'react'
import ReactDOM from 'react-dom/client'
import '@neuron-ui/tokens/css/colors.css'
import '@neuron-ui/tokens/css/spacing.css'
import '@neuron-ui/tokens/css/radius.css'
import '@neuron-ui/tokens/css/typography.css'
import { App } from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
