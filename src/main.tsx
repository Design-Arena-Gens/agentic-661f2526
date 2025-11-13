import { render } from 'solid-js/web';
import { onMount } from 'solid-js';
import App from './App';
import './index.css';

function Root() {
  onMount(() => {
    document.body.classList.remove('light');
  });
  return <App />;
}

render(() => <Root />, document.getElementById('root')!);
