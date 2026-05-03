import { Sky } from './components/Sky.jsx';
import { Toolbar } from './components/Toolbar.jsx';
import { Deck } from './components/Deck.jsx';
import { WidgetPicker } from './components/WidgetPicker.jsx';

export default function App() {
  return (
    <div className="app">
      <Sky />
      <Toolbar />
      <Deck />
      <WidgetPicker />
    </div>
  );
}
